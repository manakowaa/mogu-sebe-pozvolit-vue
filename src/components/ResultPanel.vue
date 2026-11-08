
<script setup>
defineProps({
  result: { type: Object, required: true },
  isValid: { type: Boolean, required: true },
  money: { type: Function, required: true },
})
</script>

<template>
  <section
    v-if="isValid"
    class="result-card reveal-result"
    aria-live="polite"
    aria-labelledby="result-title"
  >
    <div class="result-top">
      <span
        class="result-icon"
        :class="result.level"
        aria-hidden="true"
      >
        {{ result.icon }}
      </span>

      <div class="result-heading">
        <p class="eyebrow" style="margin: 2px 0 7px; text-align: left;">
          Результат расчёта
        </p>

        <h2
          id="result-title"
          class="result-status"
          :class="result.level"
        >
          {{ result.title }}
        </h2>

        <p class="result-summary">
          {{ result.summary }}
        </p>
      </div>
    </div>

    <div class="metric-grid">
      <div class="metric">
        <span class="metric-label">Стоимость покупки</span>
        <strong class="metric-value">{{ money(result.purchase) }}</strong>
      </div>

      <div class="metric">
        <span class="metric-label">Накопления до покупки</span>
        <strong class="metric-value">{{ money(result.savings) }}</strong>
      </div>

      <div class="metric">
        <span class="metric-label">Останется после покупки</span>
        <strong class="metric-value">{{ money(result.afterSavings) }}</strong>
      </div>
    </div>

    <p class="metric-note">{{ result.meaning }}</p>

    <div class="metric-grid">
      <div class="metric">
        <span class="metric-label">Свободный остаток в месяц</span>
        <strong class="metric-value">{{ money(result.freeCash) }}</strong>
      </div>

      <div class="metric">
        <span class="metric-label">Целевой резерв</span>
        <strong class="metric-value">{{ money(result.targetReserve) }}</strong>
      </div>

      <div class="metric">
        <span class="metric-label">До целевого резерва</span>
        <strong class="metric-value">{{ money(result.additional) }}</strong>
      </div>
    </div>

    <p v-if="result.item" class="metric-note">
      Расчёт для покупки: <strong>{{ result.item }}</strong>.
    </p>
  </section>

  <section v-else class="result-empty" aria-live="polite">
    <strong>Заполни все разделы, чтобы увидеть результат</strong>

    Укажи доход, расходы, накопления, кредитные платежи
    (если их нет — поставь 0), название и стоимость покупки,
    ближайшую цель и параметры резерва.
    Результат и рекомендации откроются только после заполнения всей формы.
  </section>
</template>

<style scoped>
/* Основной блок */
.result-card {
  font-size: 17px;
  line-height: 1.65;
}

/* Верхняя часть */
.result-top {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.result-heading {
  flex: 1;
  min-width: 0;
}

.result-icon {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  border-radius: 14px;

  font-size: 30px;
  line-height: 1;

  text-align: center;
}

/* Надпись «Результат расчёта» */
.result-card .eyebrow {
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: 0.08em;
}

/* Главный заголовок */
.result-status {
  font-size: clamp(27px, 3vw, 34px);
  line-height: 1.25;
  font-weight: 750;
  margin: 0 0 12px;
}

/* Краткое описание результата */
.result-summary {
  font-size: 17px;
  line-height: 1.7;
  margin: 0;
}

/* Сетка финансовых показателей */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 22px 0;
}

/* Карточка показателя */
.metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  padding: 16px 12px;
  border-radius: 14px;
}

/* Название показателя */
.metric-label {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;
}

/* Денежное значение */
.metric-value {
  font-size: clamp(17px, 1.5vw, 22px);
  line-height: 1.3;
  font-weight: 750;
  white-space: nowrap;
  letter-spacing: -0.04em;
}

/* Пояснения под карточками */
.metric-note {
  font-size: 16px;
  line-height: 1.7;
  margin: 18px 0;
}

/* Пустое состояние */
.result-empty {
  font-size: 17px;
  line-height: 1.75;
  padding: 24px;
}

.result-empty strong {
  display: block;
  font-size: 22px;
  line-height: 1.4;
  margin-bottom: 12px;
}

/* Мобильная версия */
@media (max-width: 600px) {
  .result-top {
    gap: 13px;
    margin-bottom: 20px;
  }

.result-icon {
  flex-basis: 48px;
  width: 48px;
  height: 48px;
  font-size: 26px;
}

  .result-card .eyebrow {
    font-size: 13px;
  }

  .result-status {
    font-size: 25px;
  }

  .result-summary {
    font-size: 16px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 17px 0;
  }

  .metric {
    padding: 17px;
    gap: 7px;
  }

  .metric-label {
    font-size: 15px;
  }

.metric-value {
  font-size: 21px;
  white-space: nowrap;
}

  .metric-note {
    font-size: 15px;
  }

  .result-empty {
    font-size: 15px;
    padding: 18px;
  }

  .result-empty strong {
    font-size: 20px;
  }
}
</style>
