<script setup lang="ts">
import type { TmpFileAudioSelect, TranscriptionSelect } from '~/db/schema'

type TmpFile = TmpFileAudioSelect & {
  transcriptions: TranscriptionSelect[]
}

const toast = useToast()
const { data, refresh } = await useFetch('/api')
const files = computed(() => data.value?.files || [])
const transcriptions = computed(() => data.value?.transcriptions || [])

const videoUrlToDownload = ref('')
const downloadingAudio = ref(false)
async function downloadAudio() {
  downloadingAudio.value = true
  try {
    await $fetch('/api/download-audio', {
      method: 'post',
      body: {
        url: videoUrlToDownload.value,
      },
    })

    downloadingAudio.value = false

    toast.add({ severity: 'contrast', summary: 'Download completed', detail: 'The file is ready for transcription', life: 3000 })
    await refresh()
  }
  catch (error) {
    console.error(error)

    downloadingAudio.value = false
  }
  finally {
    await refresh()
  }
}

const showTranscriptionDialog = ref(false)
const transcriptionResult = ref()
const transcribingFile = ref(false)
async function transcribeFile(file: TmpFile, transcriptionType: 'default' | 'short' | 'long' | 'italian' | 'english' = 'default') {
  transcribingFile.value = true

  try {
    const response = await $fetch('/api/transcribe', {
      method: 'post',
      body: {
        file,
        transcriptionType,
      },
    })

    transcriptionResult.value = response
  }
  catch (error) {
    console.error(error)
  }
  finally {
    toast.add({ severity: 'contrast', summary: 'Transcription completed', life: 3000 })
    transcribingFile.value = false
    showTranscriptionDialog.value = false

    await refresh()
  }
}

async function retrieveFileLastTranscription(file: TmpFile) {
  try {
    const response = await $fetch(`/api/${file.id}`)

    transcriptionResult.value = response
    showTranscriptionDialog.value = true
  }
  catch (error) {
    console.error(error)
  }
}

const mount = ref(true)
onMounted(() => {
  mount.value = false
})

const badgeSeverity = {
  default: 'contrast',
  short: 'info',
  long: 'success',
  italian: 'warn',
  english: 'warn',
}

const showDeleteFileConfirmationDialog = ref(false)
const fileToDelete = ref()
function deleteFile(file: TmpFile) {
  fileToDelete.value = file
  showDeleteFileConfirmationDialog.value = true
}

async function confirmDeleteFile() {
  try {
    await $fetch('/api/delete-file', {
      method: 'post',
      body: {
        file: fileToDelete.value,
      },
    })

    toast.add({ severity: 'contrast', summary: 'File deleted', life: 3000 })
    await refresh()
    showDeleteFileConfirmationDialog.value = false
    fileToDelete.value = null
  }
  catch (error) {
    console.error(error)
  }
  finally {
    await refresh()
  }
}

const showDeleteTranscriptionConfirmationDialog = ref(false)
const transcriptionToDelete = ref()
function deleteTranscription(file: TmpFile) {
  transcriptionToDelete.value = file
  showDeleteTranscriptionConfirmationDialog.value = true
}

async function confirmDeleteTranscription() {
  try {
    await $fetch('/api/delete-transcription', {
      method: 'post',
      body: {
        transcription: transcriptionToDelete.value,
      },
    })

    toast.add({ severity: 'contrast', summary: 'Transcription deleted', life: 3000 })
    await refresh()
    showDeleteTranscriptionConfirmationDialog.value = false
    transcriptionToDelete.value = null
  }
  catch (error) {
    console.error(error)
  }
  finally {
    await refresh()
  }
}
</script>

<template>
  <div v-if="mount" class="flex items-center justify-center h-screen">
    <div class="border-4 border-gray-500 border-t-gray-50 border-t-4 h-8 w-8 rounded-full animate-spin" />
  </div>
  <div v-else class="max-w-4xl mx-auto p-4">
    <div
      class="fixed h-[350px] -z-10 inset-0  [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <Tabs value="0">
      <TabList>
        <Tab value="0">
          <i class="pi pi-home mr-1" />
        </Tab>
        <Tab value="1">
          <i class="pi pi-receipt mr-1" />
          Transcriptions
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel class="flex flex-col gap-y-4" value="0">
          <Card class="boir">
            <template #content>
              <div class="flex justify-between items-center gap-3">
                <h1 class="hidden md:block text-lg tracking-tight font-semibold">
                  Video to AI Transcription
                </h1>
                <form class="flex justify-center gap-x-2" @submit.prevent="downloadAudio">
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-link" />
                    </InputIcon>
                    <InputText
                      v-model="videoUrlToDownload"
                      placeholder="https://www. ..." class="placeholder:opacity-60 !bg-zinc-900 !border-zinc-700"
                    />
                  </IconField>

                  <Button :loading="downloadingAudio" size="small" label="Download mp3" type="submit" />
                </form>
              </div>
            </template>
          </Card>

          <Card v-if="files.length">
            <template #title>
              Audio Files
            </template>
            <template #content>
              <ul class="list-none my-4">
                <li v-for="file in (files as TmpFile[])" :key="`tmp-file-${file}`" class="flex items-center justify-between p-2 border-t first:border-t-0 border-zinc-800/70">
                  <p class="text-surface-300 truncate max-w-xl text-sm font-mono">
                    {{ file.name }}
                  </p>
                  <div class="flex justify-end gap-1 ml-2">
                    <SplitButton
                      size="small" severity="secondary" :disabled="transcribingFile" raised label="Transcribe" :model="[
                        {
                          label: 'Short summary',
                          command: () => transcribeFile(file, 'short'),
                        },
                        {
                          label: 'Long summary',
                          command: () => transcribeFile(file, 'long'),
                        },
                        {
                          separator: true,
                        },
                        {
                          label: 'Translate',
                          items: [
                            {
                              label: 'Italian',
                              command: () => transcribeFile(file, 'italian'),
                            },
                            {
                              label: 'English',
                              command: () => transcribeFile(file, 'english'),
                            },
                          ],
                        },
                        {
                          separator: true,
                        },
                        {
                          label: 'View Last Transcription',
                          disabled: !file.transcriptions,
                          icon: 'pi pi-search',
                          command: () => retrieveFileLastTranscription(file),
                        },
                        {
                          separator: true,
                        },
                        {
                          label: 'Delete',
                          icon: 'pi pi-trash',
                          command: () => deleteFile(file),
                        },
                      ]"
                      @click="() => transcribeFile(file, 'default')"
                    />
                  </div>
                </li>
              </ul>
            </template>
          </Card>
        </TabPanel>
        <TabPanel value="1">
          <div v-if="transcriptions.length === 0" class="bg-transparent text-center">
            <p>
              No transcriptions
            </p>
          </div>
          <div v-else class="flex flex-col gap-y-4">
            <Panel v-for="item in (transcriptions as TranscriptionSelect[])" :key="item.id" toggleable collapsed>
              <template #header>
                <div class="max-w-[80%] flex gap-2 items-center justify-start">
                  <Badge :severity="badgeSeverity[item.type]" :value="(item.type as string)" size="small" />
                  <p class="font-mono truncate text-neutral-300">
                    {{ item.tmpFileAudioName }}
                  </p>
                </div>
              </template>

              <template #footer>
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <div class="flex items-center gap-2">
                  <!--  -->
                  </div>
                  <span class="opacity-60 text-xs">
                    {{ item.createdAt }}
                  </span>
                </div>
              </template>
              <p class="m-0">
                {{ item.text }}
              </p>
              <template #icons>
                <Button icon="pi pi-trash" severity="danger" rounded text @click="() => deleteTranscription(item)" />
              </template>
            </Panel>
          </div>
        </TabPanel>
        <TabPanel value="2">
          <p class="m-0">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
            qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <Dialog v-model:visible="showTranscriptionDialog" maximizable modal header="Transcription" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      {{ transcriptionResult }}
    </Dialog>

    <Dialog v-model:visible="showDeleteFileConfirmationDialog" modal header="Delete" :style="{ width: '25rem' }">
      <p>
        Are you sure you want to delete the file?
      </p>
      <p class="truncate font-semibold my-4">
        {{ fileToDelete?.name }}
      </p>
      <div class="flex justify-end gap-2">
        <Button size="small" type="button" severity="danger" label="Delete" @click="confirmDeleteFile" />
      </div>
    </Dialog>

    <Dialog v-model:visible="showDeleteTranscriptionConfirmationDialog" modal header="Delete" :style="{ width: '25rem' }">
      <p class="mb-5">
        Are you sure you want to delete the transcription?
      </p>
      <div class="flex justify-end gap-2">
        <Button size="small" type="button" severity="danger" label="Delete" @click="confirmDeleteTranscription" />
      </div>
    </Dialog>
  </div>
</template>
