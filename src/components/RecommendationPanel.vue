<script setup>
import { computed, ref } from 'vue'

const showSteps = ref(false)

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  isValid: {
    type: Boolean,
    required: true,
  },
  goal: {
    type: String,
    default: 'reserve',
  },
})

const goalContent = computed(() => {
  const goals = {
    reserve: {
      title: 'Сохранение финансового запаса',
      detail:
        'Сформируй неприкосновенный резерв, который поможет справиться с непредвиденными расходами и сохранить спокойствие.',
    },

    move: {
      title: 'Подготовка к переезду',
      detail:
        'Подготовь бюджет переезда: расходы на дорогу, жильё, залог и первые месяцы жизни на новом месте.',
    },

    home: {
      title: 'Покупка собственного жилья',
      detail:
        'Отдели накопления на жильё от повседневного резерва и определи комфортную сумму для регулярных накоплений.',
    },

    travel: {
      title: 'Планирование путешествия',
      detail:
        'Собери бюджет поездки заранее, чтобы путешествие не нарушило финансовую устойчивость и не обнулило накопления.',
    },

    invest: {
      title: 'Формирование инвестиционного капитала',
      detail:
        'Сначала обеспечь финансовый резерв и учти обязательства. Затем определи сумму, которую можно направить на инвестиции.',
    },

    none: {
      title: 'Финансовая устойчивость',
      detail:
        'Если конкретной цели пока нет, сосредоточься на накоплениях, создании резерва и контроле расходов.',
    },
  }

  return goals[props.goal] || goals.reserve
})

const personalOffer = computed(() => {
  const offers = {
    green: {
      title: 'Покупка возможна. Давайте сделаем её частью стратегии',
      intro:
        'На персональном разборе проверим, как провести покупку без лишней нагрузки на бюджет и не остановить движение к другим финансовым целям.',
      points: [
        {
          title: 'Проверим сценарий покупки',
          text: 'Оценим, когда и каким способом удобнее оплатить покупку с учётом ближайших обязательств.',
        },
        {
          title: 'Сохраним финансовую устойчивость',
          text: 'Продумaем, как поддерживать резерв и восстановить его после крупной траты.',
        },
        {
          title: 'Свяжем покупку с будущими целями',
          text: 'Распределим приоритеты, чтобы текущая покупка не мешала накоплениям и планам на капитал.',
        },
      ],
      cta: 'Обсудить безопасную покупку',
      request:
        'Хочу разобрать, как совершить покупку и сохранить финансовую устойчивость.',
    },

    yellow: {
      title: 'Сначала укрепим запас — и определим путь к покупке',
      intro:
        'Вместо общих советов составим реалистичный план накоплений: с комфортным темпом, промежуточными ориентирами и условиями, при которых к покупке можно вернуться.',
      points: [
        {
          title: 'Выберем комфортный темп',
          text: 'Определим посильную сумму для регулярных накоплений без чрезмерного ограничения повседневной жизни.',
        },
        {
          title: 'Расставим приоритеты',
          text: 'Решим, как сочетать резерв, обязательные платежи и накопления на желаемую покупку.',
        },
        {
          title: 'Определим момент для покупки',
          text: 'Сформулируем конкретные условия, при которых покупка станет более спокойным решением.',
        },
      ],
      cta: 'Составить личный план накоплений',
      request:
        'Хочу составить личный план создания запаса и понять, когда лучше вернуться к покупке.',
    },

    red: {
      title: 'Разберём ситуацию и найдём безопасный следующий шаг',
      intro:
        'Если сейчас лучше не торопиться, это не означает отказ от цели. На персональной встрече разложим ситуацию по приоритетам и найдём способ постепенно вернуть финансовую свободу.',
      points: [
        {
          title: 'Найдём главные точки нагрузки',
          text: 'Посмотрим, какие расходы и обязательства сильнее всего ограничивают бюджет и что реально можно изменить.',
        },
        {
          title: 'Составим план стабилизации',
          text: 'Определим последовательность действий: от обязательных платежей и резерва до возвращения к цели.',
        },
        {
          title: 'Подготовим несколько сценариев',
          text: 'Сравним варианты на ближайшие месяцы и выберем реалистичный путь без резких решений.',
        },
      ],
      cta: 'Разобрать мою ситуацию с экспертом',
      request:
        'Хочу разобрать финансовую ситуацию, определить приоритеты и составить план действий перед покупкой.',
    },
  }

  return offers[props.result?.level] || offers.red
})

const personalTitle = computed(() => personalOffer.value.title)
const personalText = computed(() => personalOffer.value.intro)

const money = (value) => {
  if (value === null || value === undefined || value === '') return 'Не указано'

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(Number(value)) + ' ₽'
}

const telegramUrl = computed(() => {
  const r = props.result || {}

  const message = [
    'Здравствуйте! Хочу записаться на персональный финансовый разбор.',
    '',
    `Моя ситуация: ${r.title || 'Результат ещё не рассчитан'}`,
    `Ближайшая цель: ${goalContent.value.title}`,
    r.item ? `Покупка: ${r.item}` : '',
    `Стоимость покупки: ${money(r.purchase)}`,
    `Доход в месяц: ${money(r.income)}`,
    `Накопления: ${money(r.savings)}`,
    `После покупки останется: ${money(r.afterSavings)}`,
    `Целевой резерв: ${money(r.targetReserve)}`,
    '',
    personalOffer.value.request,
    '',
    'Подскажите, пожалуйста, как можно договориться о встрече.',
  ]
    .filter(Boolean)
    .join('\n')

  return `https://t.me/manakovavs?text=${encodeURIComponent(message)}`
})
</script>

<template>
  <section class="plan-card goal-card" :class="{ 'is-ready': isValid }" aria-labelledby="goal-title">
    <p class="eyebrow" style="margin: 0 0 9px; text-align: left;">Фокус на будущее</p>
    <h2 id="goal-title" class="plan-title">Ближайшая цель</h2>
    <h3 class="goal-name">{{ goalContent.title }}</h3>
    <p class="plan-copy">{{ goalContent.detail }}</p>
    <p v-if="isValid" class="goal-context">{{ result.action }}</p>
  </section>

  <section v-if="isValid" class="plan-card personal-card reveal-personal" aria-labelledby="personal-title">
    <p class="eyebrow" style="margin: 0 0 9px; text-align: left;">Персональная работа</p>
    <h2 id="personal-title" class="plan-title">{{ personalTitle }}</h2>
    <p class="plan-copy">{{ personalText }}</p>

    <div class="service-list">
  <div
    v-for="(point, index) in personalOffer.points"
    :key="point.title"
    class="service-item"
  >
    <span class="service-check">
      {{ String(index + 1).padStart(2, '0') }}
    </span>

    <div>
      <strong>{{ point.title }}</strong>
      <span>{{ point.text }}</span>
    </div>
  </div>
</div>

<button
  type="button"
  class="service-button"
  @click="showSteps = !showSteps"
>
  <span>{{ showSteps ? 'Скрыть подробности' : personalOffer.cta }}</span>
  <span class="button-arrow">{{ showSteps ? '−' : '→' }}</span>
</button>

<div v-if="showSteps" class="service-next">
  <h3>Запишитесь на персональный разбор</h3>

  <p>
    Нажмите на кнопку ниже и отправьте сообщение.
    Мы уточним удобное время и договоримся о формате встречи.
  </p>

  <ol class="service-steps">
    <li>Вы отправляете заявку с результатами калькулятора.</li>
    <li>Мы согласовываем удобное время для общения.</li>
    <li>Разбираем вашу ситуацию и возможные сценарии.</li>
    <li>Формируем персональный план дальнейших действий.</li>
  </ol>

  <a
    :href="telegramUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="service-contact"
  >
  <span>Записаться на разбор</span>
  <span class="button-arrow">→</span>
  </a>
</div>
<p class="contact-caption">
  В сообщении уже будут указаны результаты вашего расчёта и выбранный сценарий.
</p>
  </section>
</template>

<style scoped>
.goal-card { background: linear-gradient(145deg, #1b222b, #181d25); }
.goal-card.is-ready { animation: card-reveal .7s cubic-bezier(.2,.75,.25,1) both; animation-delay: .22s; }
.reveal-personal { animation: card-reveal .7s cubic-bezier(.2,.75,.25,1) both; animation-delay: .48s; }
@keyframes card-reveal {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .goal-card.is-ready, .reveal-personal { animation: none; }
}
.goal-name { margin: 0 0 8px; color: #b5c8ba; font-size: 14px; }
.goal-context { margin: 14px 0 0; padding: 12px 13px; border: 1px solid rgba(182,155,103,.15); border-radius: 11px; color: #cdb47d; background: rgba(182,155,103,.08); font-size: 11px; line-height: 1.6; }
.service-list { display: grid; gap: 14px; margin: 20px 0; }
.service-item { display: flex; gap: 11px; align-items: flex-start; }
.service-check { display: grid; flex: 0 0 22px; place-items: center; width: 22px; height: 22px; border-radius: 7px; color: #b5c8ba; background: rgba(145,170,153,.13); font-size: 12px; font-weight: 800; }
.service-item strong { display: block; margin: 1px 0 4px; color: #eeeae2; font-size: 11px; }
.service-item span:not(.service-check) { display: block; color: #858d98; font-size: 10px; line-height: 1.55; }
.contact-button { display: flex; width: 100%; text-align: center; text-decoration: none; }
.contact-caption { margin: 9px 0 0; color: #858d98; font-size: 10px; line-height: 1.5; }
.service-next { margin-top: 14px; padding: 15px; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; background: #1d232c; }
.service-next-title { margin: 0 0 12px; color: #eeeae2; font-size: 13px; }
.service-steps { display: grid; gap: 11px; margin: 0 0 15px; padding: 0; list-style: none; }
.service-steps li { display: flex; gap: 10px; align-items: flex-start; }
.service-steps li span { color: #91aa99; font-size: 10px; font-weight: 800; }
.service-steps p { margin: 0; color: #b5bac1; font-size: 11px; line-height: 1.55; }

.service-button,
.service-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 58px;
  padding: 16px 22px;

  border: 1px solid var(--accent, #b99a65);
  border-radius: 14px;

  background: var(--accent, #b99a65);
  color: #fff;

  font: inherit;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  cursor: pointer;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.service-button:hover,
.service-contact:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  filter: brightness(1.06);
}

.service-button:active,
.service-contact:active {
  transform: translateY(0);
}

.button-arrow {
  flex-shrink: 0;
  font-size: 20px;
  transition: transform 0.25s ease;
}

.service-button:hover .button-arrow,
.service-contact:hover .button-arrow {
  transform: translateX(4px);
}

.service-contact {
  margin-top: 20px;
}

@media (max-width: 600px) {
  .service-button,
  .service-contact {
    min-height: 54px;
    padding: 14px 17px;
    font-size: 14px;
  }
}

/* Основной текст персонального блока */
.personal-card {
  font-size: 17px;
  line-height: 1.65;
}

/* Заголовок блока */
.personal-card h2 {
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.25;
}

/* Вводный текст */
.personal-card > p:not(.eyebrow):not(.contact-caption) {
  font-size: 17px;
  line-height: 1.7;
}

/* Надпись над заголовком */
.personal-card .eyebrow {
  font-size: 14px;
  letter-spacing: 0.08em;
}

/* Заголовки пунктов */
.personal-card .service-item strong {
  display: block;
  font-size: 17px;
  line-height: 1.45;
  margin-bottom: 6px;
}

/* Описания пунктов */
.personal-card .service-item span:not(.service-check) {
  display: block;
  font-size: 16px;
  line-height: 1.65;
}

/* Нумерация пунктов */
.personal-card .service-check {
  font-size: 17px;
  font-weight: 700;
}

/* Основные кнопки */
.personal-card .service-button,
.personal-card .service-contact {
  font-size: 17px;
  line-height: 1.4;
  min-height: 64px;
  padding: 18px 24px;
}

/* Заголовок раскрытого блока */
.personal-card .service-next h3 {
  font-size: 23px;
  line-height: 1.35;
}

/* Текст раскрытого блока */
.personal-card .service-next p,
.personal-card .service-steps li {
  font-size: 16px;
  line-height: 1.7;
}

/* Подпись под кнопкой */
.personal-card .contact-caption {
  font-size: 14px;
  line-height: 1.6;
}

/* Мобильная версия */
@media (max-width: 600px) {
  .personal-card {
    font-size: 16px;
  }

  .personal-card h2 {
    font-size: 26px;
  }

  .personal-card > p:not(.eyebrow):not(.contact-caption) {
    font-size: 16px;
  }

  .personal-card .service-item strong {
    font-size: 16px;
  }

  .personal-card .service-item span:not(.service-check) {
    font-size: 15px;
  }

  .personal-card .service-button,
  .personal-card .service-contact {
    font-size: 15px;
    min-height: 58px;
    padding: 16px 18px;
  }

  .personal-card .service-next h3 {
    font-size: 21px;
  }

  .personal-card .service-next p,
  .personal-card .service-steps li {
    font-size: 15px;
  }

  .personal-card .contact-caption {
    font-size: 13px;
  }
}

/* Увеличение шрифтов блока «Ближайшая цель» */
.goal-card {
  font-size: 17px;
  line-height: 1.65;
}

.goal-card .eyebrow {
  font-size: 14px !important;
}

.goal-card .plan-title {
  font-size: 28px;
  line-height: 1.3;
}

.goal-card .goal-name {
  font-size: 21px;
  line-height: 1.4;
}

.goal-card .plan-copy {
  font-size: 17px;
  line-height: 1.7;
}

.goal-card .goal-context {
  font-size: 16px;
  line-height: 1.7;
  padding: 16px;
}

@media (max-width: 600px) {
  .goal-card .plan-title {
    font-size: 25px;
  }

  .goal-card .goal-name {
    font-size: 19px;
  }

  .goal-card .plan-copy {
    font-size: 16px;
  }

  .goal-card .goal-context {
    font-size: 15px;
  }
}
</style>
