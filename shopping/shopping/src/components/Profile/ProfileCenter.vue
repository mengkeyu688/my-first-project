<template>
  <section class="profile-page">
    <ProfileAvatarCard
      :user="user"
      @choose-avatar="emitChooseAvatar"
      @upload-avatar="emitUploadAvatar"
    />

    <ProfileInfoForm
      @submit="emitSubmit"
      @reset="emitReset"
    />
  </section>
</template>

<script setup lang="ts">
import ProfileAvatarCard from './ProfileAvatarCard.vue'
import ProfileInfoForm from './ProfileInfoForm.vue'

interface ProfileUser {
  name: string
  avatar: string
}

interface ProfileForm {
  password: string
  confirmPassword: string
}

interface AvatarPayload {
  user: ProfileUser
  file: File | null
  fileName: string
}

defineProps<{
  user: ProfileUser
}>()

const emit = defineEmits<{
  'choose-avatar': [payload: AvatarPayload]
  'upload-avatar': [payload: AvatarPayload]
  submit: [form: ProfileForm]
  reset: []
}>()

const emitChooseAvatar = (payload: AvatarPayload) => {
  emit('choose-avatar', payload)
}

const emitUploadAvatar = (payload: AvatarPayload) => {
  emit('upload-avatar', payload)
}

const emitSubmit = (form: ProfileForm) => {
  emit('submit', form)
}

const emitReset = () => {
  emit('reset')
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 384px minmax(760px, 1fr);
  justify-content: start;
  align-content: start;
  gap: 14px;
  padding: 14px;
  overflow: hidden;
  background: #e8edf2;
  box-shadow: inset 0 0 18px rgba(37, 57, 83, 0.18);
}

@media (max-width: 1500px) {
  .profile-page {
    grid-template-columns: 320px minmax(680px, 1fr);
  }
}
</style>
