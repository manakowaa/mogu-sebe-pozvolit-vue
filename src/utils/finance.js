/** Pure financial calculations used by the calculator and automated tests. */
export function moneyNumber(value) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

export function getReserveTarget(profile = {}) {
  if (profile.reserveMode === 'manual') return moneyNumber(profile.reserveAmount)
  const months = [3, 6, 12].includes(Number(profile.reserveMonths))
    ? Number(profile.reserveMonths)
    : 3
  return (moneyNumber(profile.expenses) + moneyNumber(profile.debt)) * months
}

export function isProfileComplete(profile = {}) {
  const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== ''
  const requiredFieldsFilled = ['income', 'expenses', 'savings', 'debt', 'item', 'purchase']
    .every((field) => hasValue(profile[field]))
  const validGoal = ['reserve', 'move', 'home', 'travel', 'invest', 'none'].includes(profile.goal)
  const validReserveMode = profile.reserveMode === 'auto'
    ? [3, 6, 12].includes(Number(profile.reserveMonths))
    : profile.reserveMode === 'manual' && hasValue(profile.reserveAmount) && Number(profile.reserveAmount) >= 0
  return requiredFieldsFilled && validGoal && validReserveMode
    && moneyNumber(profile.income) > 0
    && moneyNumber(profile.purchase) > 0
    && ['expenses', 'savings', 'debt'].every((field) => Number(profile[field]) >= 0)
}

export function calculateFinance(profile = {}) {
  const income = moneyNumber(profile.income)
  const expenses = moneyNumber(profile.expenses)
  const savings = moneyNumber(profile.savings)
  const debt = moneyNumber(profile.debt)
  const purchase = moneyNumber(profile.purchase)
  const monthlyBase = expenses + debt
  const freeCash = Math.max(0, income - expenses - debt)
  const afterSavings = Math.max(0, savings - purchase)
  const debtLoad = income > 0 ? debt / income : 1
  const purchaseShare = savings > 0 ? purchase / savings : 1
  const targetReserve = getReserveTarget(profile)
  const safePurchase = Math.max(0, savings - targetReserve)
  const additional = Math.max(0, purchase - safePurchase)
  const monthlySaving = Math.max(1, freeCash * 0.35)
  const waitMonths = Math.ceil(additional / monthlySaving)
  const freedomPrice = freeCash > 0 ? purchase / freeCash : Infinity
  const incomeCanSupportPurchase = income >= purchase / 2
  const hasLittleSavings = savings < Math.max(monthlyBase * 2, purchase)
  const hasNoSavings = savings <= 0

  let level, title, icon, summary, meaning, recommendation, action
  if (incomeCanSupportPurchase && (hasNoSavings || hasLittleSavings)) {
    level = purchase <= freeCash * 2 ? 'yellow' : 'red'
    title = level === 'yellow' ? 'Доход позволяет, но запас маленький' : 'Сначала лучше создать запас'
    icon = level === 'yellow' ? '•' : '!'
    summary = `По доходу покупка может быть посильной. Главный вопрос сейчас — накопления: ${hasNoSavings ? 'их пока нет.' : 'их пока недостаточно для спокойной покупки.'}`
    meaning = `После покупки у тебя останется ${formatMoney(afterSavings)}. ${hasNoSavings ? 'Без накоплений одна крупная трата может оставить тебя без финансового запаса.' : 'Запас после покупки будет небольшим, поэтому важно оценить, сколько денег останется.'}`
    recommendation = hasNoSavings
      ? 'Не обязательно отказываться от покупки навсегда. Сначала создай хотя бы небольшой запас, чтобы покупка не оставила тебя практически без денег.'
      : 'По доходу покупка может быть посильной, но сейчас слишком большая часть накоплений уйдёт на одну вещь. Если возможно, увеличь запас перед покупкой.'
    action = additional > 0 ? `Ориентир — накопить ещё ${formatMoney(additional)}, а затем вернуться к покупке.` : 'Сначала увеличь финансовый запас, а потом спокойно решай, покупать ли.'
  } else if (savings >= targetReserve && afterSavings >= targetReserve && debtLoad < 0.4 && freedomPrice <= 4) {
    level = 'green'
    title = 'Можно рассматривать покупку'
    icon = '✓'
    summary = 'По введённым цифрам покупка выглядит посильной: доход покрывает базовые расходы и платежи, а после покупки остаётся резерв.'
    meaning = `После покупки останется ${formatMoney(afterSavings)}. По текущей оценке это не должно критично уменьшить финансовую подушку.`
    recommendation = 'Если покупка действительно нужна и все регулярные платежи учтены, её можно рассматривать. После покупки продолжай пополнять резерв.'
    action = 'Проверь, что в расходах учтены нерегулярные траты и ближайшие обязательные платежи.'
  } else if (afterSavings >= monthlyBase * 2 && purchaseShare <= 0.7) {
    level = 'yellow'
    title = 'Лучше немного подождать'
    icon = '•'
    summary = 'Оплатить покупку может получиться, но она заметно уменьшит запас денег.'
    meaning = `После покупки останется ${formatMoney(afterSavings)}. Это может быть приемлемо, но резерв станет меньше.`
    recommendation = 'Если покупка не срочная, подожди и увеличь накопления. Так будет проще купить вещь без ощущения, что денег стало слишком мало.'
    action = additional > 0 ? `Ориентир — накопить ещё ${formatMoney(additional)}.` : 'Дай накоплениям немного вырасти и вернись к покупке позже.'
  } else {
    level = 'red'
    title = 'Сейчас лучше не торопиться'
    icon = '!'
    summary = 'Сейчас покупка может слишком сильно уменьшить финансовый запас.'
    meaning = `После покупки останется ${formatMoney(afterSavings)}. Если появятся неожиданные расходы, свободных денег может не хватить.`
    recommendation = 'Пока лучше укрепить резерв и проверить бюджет. Это не отказ от цели, а способ прийти к ней с большей финансовой устойчивостью.'
    action = additional > 0 ? `Ориентир — накопить ещё ${formatMoney(additional)}, прежде чем возвращаться к покупке.` : 'Сначала восстанови накопления, а затем вернись к цели.'
  }

  return {
    level, title, icon, summary, meaning, recommendation, action,
    purchase, savings, afterSavings, freeCash, targetReserve, safePurchase,
    additional, waitMonths, freedomPrice, monthlyBase, income, expenses, debt,
    waitingText: additional <= 0 ? 'можно рассматривать сейчас' : waitMonths <= 1 ? 'около 1 месяца' : `около ${waitMonths} месяцев`,
    item: String(profile.item ?? '').trim(),
  }
}

function formatMoney(value) {
  return `${Math.round(Math.max(0, Number(value) || 0)).toLocaleString('ru-RU')} ₽`
}
