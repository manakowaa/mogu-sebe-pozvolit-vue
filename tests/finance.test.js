import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateFinance, getReserveTarget, isProfileComplete, moneyNumber } from '../src/utils/finance.js'

test('moneyNumber parses formatted amounts and clamps invalid/negative values', () => {
  assert.equal(moneyNumber('125 000 ₽'), 125000)
  assert.equal(moneyNumber('1,5'), 15)
  assert.equal(moneyNumber('-500'), 0)
  assert.equal(moneyNumber('не число'), 0)
  assert.equal(moneyNumber(null), 0)
})

test('automatic reserve uses expenses plus monthly debt payment', () => {
  assert.equal(getReserveTarget({ expenses: 30000, debt: 10000, reserveMonths: 3 }), 120000)
  assert.equal(getReserveTarget({ expenses: 30000, debt: 10000, reserveMonths: 6 }), 240000)
  assert.equal(getReserveTarget({ expenses: 30000, debt: 10000, reserveMonths: 12 }), 480000)
  assert.equal(getReserveTarget({ expenses: 30000, debt: 10000, reserveMonths: 9 }), 120000)
})

test('manual reserve overrides automatic calculation', () => {
  assert.equal(getReserveTarget({ expenses: 30000, debt: 10000, reserveMode: 'manual', reserveMonths: 6, reserveAmount: '85000' }), 85000)
  assert.equal(getReserveTarget({ reserveMode: 'manual', reserveAmount: '-100' }), 0)
})

test('free cash and money left after purchase never become negative', () => {
  const result = calculateFinance({ income: 50000, expenses: 60000, debt: 10000, savings: 20000, purchase: 30000 })
  assert.equal(result.freeCash, 0)
  assert.equal(result.afterSavings, 0)
  assert.equal(result.safePurchase, 0)
})

test('green recommendation requires reserve after purchase and manageable debt load', () => {
  const result = calculateFinance({ income: 100000, expenses: 20000, debt: 10000, savings: 500000, purchase: 50000, reserveMonths: 3, item: 'Ноутбук' })
  assert.equal(result.level, 'green')
  assert.equal(result.targetReserve, 90000)
  assert.equal(result.afterSavings, 450000)
  assert.equal(result.item, 'Ноутбук')
})

test('low savings with sufficient income returns a cautious yellow or red level', () => {
  const yellow = calculateFinance({ income: 100000, expenses: 40000, debt: 0, savings: 0, purchase: 50000 })
  const red = calculateFinance({ income: 100000, expenses: 40000, debt: 0, savings: 0, purchase: 150000 })
  assert.equal(yellow.level, 'yellow')
  assert.equal(red.level, 'red')
})

test('waiting period is rounded up using 35% of free cash, with a minimum saving of one ruble', () => {
  const result = calculateFinance({ income: 100000, expenses: 50000, debt: 0, savings: 50000, purchase: 100000, reserveMode: 'manual', reserveAmount: 50000 })
  assert.equal(result.additional, 100000)
  assert.equal(result.waitMonths, 6)
  const noFreeCash = calculateFinance({ income: 10000, expenses: 10000, debt: 0, savings: 0, purchase: 100 })
  assert.equal(noFreeCash.waitMonths, 100)
})

test('zero monthly free cash is represented as an infinite freedom price', () => {
  const result = calculateFinance({ income: 20000, expenses: 20000, debt: 0, savings: 100000, purchase: 10000 })
  assert.equal(result.freedomPrice, Infinity)
  assert.equal(result.freeCash, 0)
})


test('profile is incomplete until every section is filled, including zero values', () => {
  const profile = {
    income: 100000, expenses: 50000, savings: 200000, debt: 0,
    item: 'Ноутбук', purchase: 50000, goal: 'reserve',
    reserveMode: 'auto', reserveMonths: 3,
  }
  assert.equal(isProfileComplete(profile), true)
  assert.equal(isProfileComplete({ ...profile, expenses: '' }), false)
  assert.equal(isProfileComplete({ ...profile, savings: '' }), false)
  assert.equal(isProfileComplete({ ...profile, debt: '' }), false)
  assert.equal(isProfileComplete({ ...profile, item: '' }), false)
  assert.equal(isProfileComplete({ ...profile, purchase: '' }), false)
  assert.equal(isProfileComplete({ ...profile, reserveMode: 'manual', reserveAmount: '' }), false)
  assert.equal(isProfileComplete({ ...profile, reserveMode: 'manual', reserveAmount: 0 }), true)
})
