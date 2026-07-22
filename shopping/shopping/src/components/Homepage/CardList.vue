// 卡片列表组件
<template>
  <article class="stats-panel">
    <div class="card-title">{{ title }}</div>

    <div class="stats-grid">
      <button
        v-for="item in items"
        :key="item.id"
        class="stat-card"
        type="button"
        @click="emitCardClick(item)"
      >
        <span :class="['stat-icon', `stat-icon-${item.id}`]">
          <i></i>
        </span>
        <span class="stat-value">{{ item.value }}</span>
        <span class="stat-label">{{ item.label }}</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
interface StatCard {
  id: string
  label: string
  value: string
  unit: string
}

defineProps<{
  title: string
  items: StatCard[]
}>()

const emit = defineEmits<{
  'card-click': [card: StatCard]
}>()

const emitCardClick = (card: StatCard) => {
  emit('card-click', card)
}
</script>

<style scoped>
.stats-panel {
  height: 224px;
  overflow: hidden;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(37, 57, 83, 0.18);
}

.card-title {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #303133;
  font-size: 24px;
  border-bottom: 1px solid #e7edf4;
}

.stats-grid {
  height: 154px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding: 24px;
}

.stat-card {
  height: 106px;
  position: relative;
  display: grid;
  grid-template-columns: 102px 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  padding: 0 24px 0 0;
  border: 1px solid #dfe6ef;
  border-radius: 0;
  color: #303133;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.stat-icon {
  grid-row: 1 / 3;
  width: 102px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.stat-icon-goods {
  background: #f4b000;
}

.stat-icon-category {
  background: #a978ff;
}

.stat-icon-visits {
  background: #55acee;
}

.stat-icon i {
  width: 74px;
  height: 88px;
  position: relative;
  display: block;
  border: 6px solid #ffffff;
}

.stat-icon i::before {
  content: "";
  position: absolute;
  left: 15px;
  top: -6px;
  width: 56px;
  height: 88px;
  border: 6px solid #ffffff;
  border-left: 0;
}

.stat-icon i::after {
  content: "";
  position: absolute;
  left: 26px;
  top: 18px;
  width: 26px;
  height: 6px;
  background: #ffffff;
  box-shadow: 0 19px 0 #ffffff, 0 38px 0 #ffffff;
  border-radius: 4px;
}

.stat-value {
  align-self: end;
  justify-self: end;
  color: #1f2d3d;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  align-self: start;
  justify-self: end;
  margin-top: 14px;
  color: #1f2d3d;
  font-size: 16px;
  line-height: 1;
}
</style>
