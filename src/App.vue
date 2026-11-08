<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ProfileForm from './components/ProfileForm.vue'
import ResultPanel from './components/ResultPanel.vue'
import RecommendationPanel from './components/RecommendationPanel.vue'
import {
  calculateFinance,
  getReserveTarget,
  isProfileComplete,
  moneyNumber,
} from './utils/finance.js'

const STORAGE_KEY = 'mogu_sebe_pozvolit_profile'

const hasLoaded = ref(false)
const skipNextSave = ref(false)
const savedAt = ref('')

const form = ref({
  income: '',
  expenses: '',
  savings: '',
  debt: '',
  item: '',
  purchase: '',
  goal: 'reserve',
  reserveMode: 'auto',
  reserveMonths: 3,
  reserveAmount: '',
})

const money = (value) =>
  `${Math.round(Math.max(0, Number(value) || 0)).toLocaleString('ru-RU')} ₽`

const reserveTarget = computed(() => getReserveTarget(form.value))
const result = computed(() => calculateFinance(form.value))

const validationErrors = computed(() => {
  const errors = {}

  if (moneyNumber(form.value.income) <= 0) {
    errors.income = 'Укажи доход больше нуля.'
  }

  if (moneyNumber(form.value.purchase) <= 0) {
    errors.purchase = 'Укажи стоимость покупки больше нуля.'
  }

  if (
    form.value.reserveMode === 'manual' &&
    Number(form.value.reserveAmount) < 0
  ) {
    errors.reserveAmount = 'Сумма резерва не может быть отрицательной.'
  }

  return errors
})

const isValid = computed(
  () => Object.keys(validationErrors.value).length === 0
)

const isComplete = computed(
  () => isProfileComplete(form.value) && isValid.value
)

const lastSavedText = computed(() => {
  if (!savedAt.value) return 'Данные пока не сохранены'

  const date = new Date(savedAt.value)

  if (Number.isNaN(date.getTime())) {
    return 'Данные сохранены на этом устройстве'
  }

  return `Сохранено ${new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)}`
})

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved)
      form.value = { ...form.value, ...parsed }
      savedAt.value = parsed.updatedAt || ''
    }
  } catch (error) {
    console.warn('Не удалось загрузить сохранённый профиль:', error)
  }

  hasLoaded.value = true
})

watch(
  form,
  (newForm) => {
    if (!hasLoaded.value) return

    if (skipNextSave.value) {
      skipNextSave.value = false
      return
    }

    const updatedAt = new Date().toISOString()
    const profile = { ...newForm, updatedAt }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      savedAt.value = updatedAt
    } catch (error) {
      console.warn('Не удалось сохранить профиль в браузере:', error)
    }
  },
  { deep: true }
)

function resetForm() {
  skipNextSave.value = true

  form.value = {
    income: '',
    expenses: '',
    savings: '',
    debt: '',
    item: '',
    purchase: '',
    goal: 'reserve',
    reserveMode: 'auto',
    reserveMonths: 3,
    reserveAmount: '',
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Не удалось очистить сохранённый профиль:', error)
  }

  savedAt.value = ''
}
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true">М</span>
        <span>Могу себе позволить?</span>
      </div>

      <p class="eyebrow">Личный финансовый ориентир</p>

      <h1>Можно<br /><span>покупать?</span></h1>

      <p class="hero-copy">
        Оцени покупку не только по цене, но и по тому,
        сколько финансовой свободы останется после неё.
      </p>

      <div class="hero-note">
        <span class="note-dot"></span>
        Расчёт на основе введённых тобой данных
      </div>
    </header>

    <section class="workspace" aria-label="Финансовый калькулятор">
      <ProfileForm
        v-model="form"
        :errors="validationErrors"
        :reserve-target="reserveTarget"
        :last-saved-text="lastSavedText"
        @reset="resetForm"
      />

      <div class="results-column">
        <ResultPanel
          :result="result"
          :is-valid="isComplete"
          :money="money"
        />

        <RecommendationPanel
          :result="result"
          :is-valid="isValid"
          :goal="form.goal"
        />
      </div>
    </section>

    <footer class="app-footer">
      <p>
        Расчёт является ориентировочной оценкой финансовой нагрузки и не заменяет индивидуальную финансовую консультацию
      </p>

      <p class="author-line">
      © 2026
      </p>
            <p class="author-line">
      Все права защищены
      </p>
            <p class="author-line">
      Автор — Манакова В. С. 
      </p>
    </footer>
  </main>
</template>

<style>
:root {
  color-scheme: dark;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #eeeae2;
  background: #0d1015;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;

  --bg: #0d1015;
  --card: #181d25;
  --card2: #1d232c;
  --input: #10141a;
  --border: rgba(255, 255, 255, .07);
  --border2: #303844;
  --text: #eeeae2;
  --soft: #c7c7c2;
  --muted: #858d98;
  --green: #91aa99;
  --green-light: #b5c8ba;
  --yellow: #b69b67;
  --yellow-light: #cdb47d;
  --red: #9d6c6c;
  --red-light: #bd8888;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(
      ellipse at 50% -20%,
      rgba(68, 80, 97, .28),
      transparent 55%
    ),
    var(--bg);
  color: var(--text);
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  width: min(1000px, calc(100% - 30px));
  margin: 0 auto;
  padding: 30px 0 45px;
}

/* Шапка */

.hero {
  max-width: 680px;
  margin: 0 auto 34px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #9da5b0;
  font-size: 14px;
  font-weight: 750;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid #3b444f;
  border-radius: 10px;
  color: #b5c8ba;
  background: #181d25;
  font-size: 19px;
}

.eyebrow {
  margin: 28px 0 13px;
  color: #9da5b0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .15em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(43px, 7vw, 70px);
  line-height: .95;
  letter-spacing: -.065em;
  font-weight: 800;
}

h1 span {
  color: #91aa99;
}

.hero-copy {
  max-width: 560px;
  margin: 20px auto 17px;
  color: var(--muted);
  font-size: 17px;
  line-height: 1.75;
}

.hero-note {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #9da5b0;
  font-size: 14px;
}

.note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #91aa99;
}

/* Основная область */

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
  gap: 16px;
  align-items: start;
}

.card,
.result-card,
.plan-card {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 14px 40px rgba(0, 0, 0, .16);
}

.card-heading {
  margin: 0 0 7px;
  color: var(--text);
  font-size: 19px;
  letter-spacing: -.03em;
}

.card-intro {
  margin: 0 0 23px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

/* Поля формы */

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.field.full {
  grid-column: 1 / -1;
}

label {
  color: #c7c7c2;
  font-size: 11px;
  font-weight: 700;
}

.field-hint {
  color: #858d98;
  font-size: 10px;
  line-height: 1.45;
}

input,
select {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 11px 12px;
  border: 1px solid #303844;
  border-radius: 10px;
  color: #eeeae2;
  background: #10141a;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  color-scheme: dark;
}

input:focus,
select:focus {
  border-color: #91aa99;
  box-shadow: 0 0 0 3px rgba(145, 170, 153, .12);
}

input[aria-invalid="true"] {
  border-color: #bd8888;
}

.error-text {
  color: #bd8888;
  font-size: 11px;
}

.section-label {
  margin: 24px 0 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  color: #858d98;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.reserve-preview {
  margin-top: 12px;
  padding: 12px 13px;
  border: 1px solid rgba(145, 170, 153, .15);
  border-radius: 12px;
  color: #b5c8ba;
  background: rgba(145, 170, 153, .08);
  font-size: 11px;
  line-height: 1.55;
}

/* Кнопки формы */

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
}

.saved-note {
  color: #858d98;
  font-size: 10px;
  line-height: 1.4;
}

.button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 11px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 750;
  transition: transform .15s, background .15s;
}

.button:active {
  transform: translateY(1px);
}

.button-primary {
  color: #101611;
  background: #91aa99;
}

.button-primary:hover {
  background: #b5c8ba;
}

.button-quiet {
  color: #c7c7c2;
  border-color: #303844;
  background: #1d232c;
}

.button-quiet:hover {
  background: #252d38;
}

/* Результаты */

.results-column {
  display: grid;
  gap: 14px;
}

.result-empty {
  padding: 24px;
  border: 1px dashed #3b444f;
  border-radius: 16px;
  color: var(--muted);
  background: rgba(24, 29, 37, .55);
  font-size: 17px;
  line-height: 1.7;
}

.result-empty strong {
  display: block;
  margin-bottom: 9px;
  color: var(--text);
  font-size: 22px;
}

.result-card {
  background: linear-gradient(145deg, #1b222b, #181d25);
}

.reveal-result {
  animation: card-reveal .7s cubic-bezier(.2, .75, .25, 1) both;
}

@keyframes card-reveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-result {
    animation: none;
  }
}

.result-top {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.result-icon {
  display: grid;
  flex: 0 0 40px;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 800;
}

.result-icon.green {
  color: var(--green-light);
  background: rgba(145, 170, 153, .13);
}

.result-icon.yellow {
  color: var(--yellow-light);
  background: rgba(182, 155, 103, .13);
}

.result-icon.red {
  color: var(--red-light);
  background: rgba(157, 108, 108, .13);
}

.result-status {
  margin: 2px 0 7px;
  font-size: clamp(27px, 3vw, 34px);
  line-height: 1.3;
  letter-spacing: -.025em;
}

.result-status.green {
  color: var(--green-light);
}

.result-status.yellow {
  color: var(--yellow-light);
}

.result-status.red {
  color: var(--red-light);
}

.result-summary {
  margin: 0;
  color: #b5bac1;
  font-size: 17px;
  line-height: 1.7;
}

/* Финансовые показатели */

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 20px;
}

.metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 14px 9px;
  border: 1px solid rgba(255, 255, 255, .035);
  border-radius: 11px;
  background: var(--card2);
}

.metric-label {
  display: block;
  margin-bottom: 0;
  color: #858d98;
  font-size: 15px;
  line-height: 1.4;
}

.metric-value {
  display: block;
  min-width: 0;
  color: #eeeae2;
  font-size: clamp(12px, 1.25vw, 16px);
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -.045em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.metric-note {
  margin: 16px 0 0;
  color: #b5bac1;
  font-size: 16px;
  line-height: 1.7;
}

/* Рекомендации */

.plan-card {
  background: #181d25;
}

.plan-title {
  margin: 0 0 10px;
  color: var(--text);
  font-size: 28px;
  letter-spacing: -.02em;
}

.plan-copy {
  margin: 0;
  color: #b5bac1;
  font-size: 17px;
  line-height: 1.7;
}

.plan-action {
  margin-top: 14px;
  padding: 13px;
  border: 1px solid rgba(182, 155, 103, .15);
  border-radius: 11px;
  color: #cdb47d;
  background: rgba(182, 155, 103, .08);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.6;
}

.plan-list {
  display: grid;
  gap: 10px;
  margin: 17px 0 0;
  padding: 0;
  list-style: none;
}

.plan-list li {
  display: flex;
  gap: 9px;
  color: #b5bac1;
  font-size: 15px;
  line-height: 1.6;
}

.plan-list li::before {
  content: "✓";
  color: #91aa99;
  font-weight: 800;
}

/* Подвал */

.app-footer {
  max-width: 760px;
  margin: 28px auto 0;
  text-align: center;
  color: #858d98;
  font-size: 14px;
  line-height: 1.8;
}

.app-footer p {
  margin: 7px 0;
}

.author-line {
  margin-top: 18px !important;
  color: #b5bac1;
  font-size: 15px;
  font-weight: 700;
}

.author-link {
  color: #91aa99;
  font-size: 15px;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.author-link:hover {
  color: #b5c8ba;
}

/* Планшеты */

@media (max-width: 850px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .results-column {
    grid-row: 2;
  }

  .app-shell {
    max-width: 680px;
  }

  .metric-value {
    font-size: clamp(13px, 2vw, 17px);
  }
}

/* Телефоны */

@media (max-width: 600px) {
  .brand {
    font-size: 12px;
    letter-spacing: 1px;
  }

  .brand-mark {
    width: 31px;
    height: 31px;
    font-size: 17px;
  }

  .hero > .eyebrow {
    font-size: 12px;
  }

  .hero-copy {
    font-size: 15px;
  }

  .hero-note {
    font-size: 12px;
  }

  .app-footer {
    font-size: 13px;
    line-height: 1.75;
  }

  .author-line,
  .author-link {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .app-shell {
    width: calc(100% - 22px);
    padding: 20px 0 28px;
  }

  .hero {
    margin-bottom: 22px;
  }

  .card,
  .result-card,
  .plan-card {
    padding: 18px;
    border-radius: 15px;
  }

  .field-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric {
    padding: 12px 8px;
  }

  .metric:last-child {
    grid-column: 1 / -1;
  }

  .metric-value {
    font-size: clamp(12px, 3.2vw, 16px);
  }

  .metric-label {
    font-size: 14px;
  }

  .result-summary {
    font-size: 15px;
  }

  .metric-note {
    font-size: 14px;
  }

  .plan-title {
    font-size: 25px;
  }

  .plan-copy {
    font-size: 15px;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-actions .button {
    width: 100%;
  }

  .saved-note {
    order: 2;
    text-align: center;
  }
}
</style>
