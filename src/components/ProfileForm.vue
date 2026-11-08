
<script setup>
import { computed, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
  reserveTarget: { type: Number, required: true },
  lastSavedText: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'reset'])

const money = (value) =>
  `${Math.round(Math.max(0, Number(value) || 0)).toLocaleString('ru-RU')} ₽`

const goalDescriptions = {
  reserve: 'Сначала определить неприкосновенный запас и не использовать его на покупку.',
  move: 'Подготовить бюджет переезда: расходы на дорогу, жильё, залог и первые месяцы.',
  home: 'Отделить накопления на жильё от повседневного резерва и оценить регулярный взнос.',
  travel: 'Заранее собрать бюджет поездки так, чтобы после неё сохранился финансовый запас.',
  invest: 'Сначала определить резерв и обязательства, затем сумму, которую можно инвестировать без риска для бюджета.',
  none: 'Можно оставить цель открытой и сначала укрепить финансовую устойчивость.',
}

const goalDescription = computed(
  () => goalDescriptions[props.modelValue.goal] || goalDescriptions.reserve
)

const reserveDescription = computed(() =>
  props.modelValue.reserveMode === 'manual'
    ? 'Используется сумма, которую ты указала вручную.'
    : `Расчёт: (ежемесячные расходы + платежи по кредитам) × ${props.modelValue.reserveMonths} мес.`
)

const numericFields = [
  'income',
  'expenses',
  'savings',
  'debt',
  'purchase',
  'reserveAmount',
  'reserveMonths',
]

function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return ''

  const number = Number(value)

  return Number.isFinite(number)
    ? new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 0,
      }).format(number)
    : ''
}

function update(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: numericFields.includes(key)
      ? value === '' ? '' : Number(value)
      : value,
  })
}

function updateMoneyInput(key, event) {
  const input = event.target

  const digitsBeforeCaret = input.value
    .slice(0, input.selectionStart)
    .replace(/\D/g, '').length

  const digits = input.value.replace(/\D/g, '')

  update(key, digits === '' ? '' : Number(digits))

  nextTick(() => {
    const formatted = formatNumber(digits)

    let caret = 0
    let digitCount = 0

    while (caret < formatted.length && digitCount < digitsBeforeCaret) {
      if (/\d/.test(formatted[caret])) digitCount++
      caret++
    }

    input.value = formatted
    input.setSelectionRange(caret, caret)
  })
}
</script>

<template>
  <section class="card profile-form" aria-labelledby="form-title">
    <h2 id="form-title" class="card-heading">
      Твой финансовый профиль
    </h2>

    <p class="card-intro">
      Заполни все разделы, включая нулевые значения там, где расходов,
      накоплений или кредитов нет. Результат появится только после
      заполнения всей формы.
    </p>

    <div class="field-grid">
      <div class="field">
        <label for="income">Доход в месяц, ₽ *</label>

        <input
          id="income"
          :value="formatNumber(modelValue.income)"
          type="text"
          inputmode="numeric"
          placeholder="130 000"
          :aria-invalid="Boolean(errors.income)"
          @input="updateMoneyInput('income', $event)"
        />

        <span v-if="errors.income" class="error-text">
          {{ errors.income }}
        </span>

        <span v-else class="field-hint">
          После налогов, в среднем за месяц
        </span>
      </div>

      <div class="field">
        <label for="expenses">Расходы в месяц, ₽ *</label>

        <input
          id="expenses"
          :value="formatNumber(modelValue.expenses)"
          type="text"
          inputmode="numeric"
          placeholder="60 000"
          @input="updateMoneyInput('expenses', $event)"
        />

        <span class="field-hint">
          Регулярные расходы без кредита
        </span>
      </div>

      <div class="field">
        <label for="savings">Накопления сейчас, ₽ *</label>

        <input
          id="savings"
          :value="formatNumber(modelValue.savings)"
          type="text"
          inputmode="numeric"
          placeholder="200 000"
          @input="updateMoneyInput('savings', $event)"
        />

        <span class="field-hint">
          Деньги, доступные для цели
        </span>
      </div>

      <div class="field">
        <label for="debt">Платежи по кредитам в месяц, ₽ *</label>

        <input
          id="debt"
          :value="formatNumber(modelValue.debt)"
          type="text"
          inputmode="numeric"
          placeholder="15 000"
          @input="updateMoneyInput('debt', $event)"
        />

        <span class="field-hint">
          Сумма ежемесячных платежей
        </span>
      </div>
    </div>

    <p class="section-label">
      Покупка и цель
    </p>

    <div class="field-grid">
      <div class="field">
        <label for="item">Что хочешь купить? *</label>

        <input
          id="item"
          :value="modelValue.item"
          type="text"
          maxlength="100"
          placeholder="Например, ноутбук"
          @input="update('item', $event.target.value)"
        />
      </div>

      <div class="field">
        <label for="purchase">Стоимость покупки, ₽ *</label>

        <input
          id="purchase"
          :value="formatNumber(modelValue.purchase)"
          type="text"
          inputmode="numeric"
          placeholder="50 000"
          :aria-invalid="Boolean(errors.purchase)"
          @input="updateMoneyInput('purchase', $event)"
        />

        <span v-if="errors.purchase" class="error-text">
          {{ errors.purchase }}
        </span>
      </div>

      <div class="field full">
        <label for="goal">Ближайшая цель *</label>

        <select
          id="goal"
          :value="modelValue.goal"
          @change="update('goal', $event.target.value)"
        >
          <option value="reserve">Сохранить финансовый запас</option>
          <option value="move">Переезд</option>
          <option value="home">Жильё</option>
          <option value="travel">Путешествие</option>
          <option value="invest">Инвестиции</option>
          <option value="none">Конкретной цели нет</option>
        </select>

        <span class="field-hint">
          {{ goalDescription }}
        </span>
      </div>
    </div>

    <p class="section-label">
      Неприкосновенный резерв
    </p>

    <div class="field-grid">
      <div class="field full">
        <label for="reserveMode">
          Как определить размер резерва? *
        </label>

        <select
          id="reserveMode"
          :value="modelValue.reserveMode"
          @change="update('reserveMode', $event.target.value)"
        >
          <option value="auto">
            Рассчитать по расходам и кредитам
          </option>
          <option value="manual">
            Указать сумму вручную
          </option>
        </select>
      </div>

      <div
        v-if="modelValue.reserveMode === 'auto'"
        class="field full"
      >
        <label for="reserveMonths">
          На сколько месяцев нужен резерв? *
        </label>

        <select
          id="reserveMonths"
          :value="modelValue.reserveMonths"
          @change="update('reserveMonths', $event.target.value)"
        >
          <option :value="3">3 месяца</option>
          <option :value="6">6 месяцев</option>
          <option :value="12">12 месяцев</option>
        </select>
      </div>

      <div v-else class="field full">
        <label for="reserveAmount">
          Размер резерва, ₽ *
        </label>

        <input
          id="reserveAmount"
          :value="formatNumber(modelValue.reserveAmount)"
          type="text"
          inputmode="numeric"
          placeholder="Например, 120 000"
          @input="updateMoneyInput('reserveAmount', $event)"
        />

        <span v-if="errors.reserveAmount" class="error-text">
          {{ errors.reserveAmount }}
        </span>
      </div>
    </div>

    <div class="reserve-preview">
      <strong>
        Неприкосновенный резерв: {{ money(reserveTarget) }}
      </strong>

      <span>
        {{ reserveDescription }}
      </span>
    </div>

    <div class="form-actions">
      <span class="saved-note" aria-live="polite">
        {{ lastSavedText }}
      </span>

      <button
        class="button button-quiet"
        type="button"
        @click="emit('reset')"
      >
        Сбросить данные
      </button>
    </div>
  </section>
</template>

<style scoped>
/* =========================================
   ОСНОВА ФОРМЫ
========================================= */

.profile-form {
  font-size: 16px;
  line-height: 1.6;
}

/* =========================================
   ЗАГОЛОВОК И ВВЕДЕНИЕ
========================================= */

.profile-form .card-heading {
  font-size: clamp(25px, 2.5vw, 29px);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.035em;
  margin-bottom: 14px;
}

.profile-form .card-intro {
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 28px;
}

/* =========================================
   ПОДПИСИ ПОЛЕЙ
========================================= */

.profile-form .field label {
  display: block;
  font-size: 16px;
  line-height: 1.45;
  font-weight: 600;
  margin-bottom: 9px;
}

/* =========================================
   ПОЛЯ ВВОДА И СПИСКИ
========================================= */

.profile-form .field input,
.profile-form .field select {
  width: 100%;
  min-height: 56px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 17px;
  line-height: 1.4;
  font-weight: 500;
  border-radius: 12px;
}

.profile-form .field input::placeholder {
  font-size: 16px;
  opacity: 0.65;
}

/* =========================================
   ПОДСКАЗКИ И ОШИБКИ
========================================= */

.profile-form .field-hint,
.profile-form .error-text {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.55;
}

.profile-form .error-text {
  font-weight: 550;
}

/* =========================================
   НАЗВАНИЯ РАЗДЕЛОВ
========================================= */

.profile-form .section-label {
  margin-top: 30px;
  margin-bottom: 17px;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.015em;
}

/* =========================================
   ПОЛЕ С РЕЗЕРВОМ
========================================= */

.profile-form .reserve-preview {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 22px;
  padding: 18px 20px;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.6;
}

.profile-form .reserve-preview strong {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
}

.profile-form .reserve-preview span {
  font-size: 15px;
  line-height: 1.6;
}

/* =========================================
   КНОПКИ И СОХРАНЕНИЕ
========================================= */

.profile-form .form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.profile-form .saved-note {
  font-size: 14px;
  line-height: 1.5;
}

.profile-form .form-actions button {
  min-height: 48px;
  padding: 12px 19px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

/* =========================================
   МОБИЛЬНАЯ ВЕРСИЯ
========================================= */

@media (max-width: 600px) {
  .profile-form .card-heading {
    font-size: 24px;
  }

  .profile-form .card-intro {
    font-size: 15px;
    line-height: 1.65;
  }

  .profile-form .field label {
    font-size: 15px;
  }

  .profile-form .field input,
  .profile-form .field select {
    min-height: 53px;
    font-size: 16px;
  }

  .profile-form .field-hint,
  .profile-form .error-text {
    font-size: 14px;
  }

  .profile-form .section-label {
    font-size: 17px;
  }

  .profile-form .reserve-preview {
    padding: 16px;
  }

  .profile-form .reserve-preview strong {
    font-size: 17px;
  }

  .profile-form .reserve-preview span {
    font-size: 14px;
  }

  .profile-form .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .profile-form .saved-note {
    font-size: 13px;
  }

  .profile-form .form-actions button {
    width: 100%;
    font-size: 15px;
  }
}
</style>
