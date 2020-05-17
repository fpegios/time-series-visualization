<template>
  <div id="file-upload" class="d-flex align-center">
    <v-card class="mx-auto" max-width="450px" :loading="isSelecting">
      
			<v-card-title>Please upload your time series data</v-card-title>
      <v-card-text>
        <template v-if="$store.getters.fileData">
          You have already uploaded the file <b>{{ $store.getters.fileName }}</b>
        </template>
        <template v-else>No file has been uploaded</template>
      </v-card-text>

      <v-card-actions class="justify-end px-4 py-3">
        <v-btn v-if="$store.getters.fileData" color="red darken-1" text to="/statistics">Show Current Data</v-btn>
        <v-btn color="red" dark @click="onNewFileButtonHandler">
          <input ref="uploader" class="d-none" type="file" accept=".csv" @change="onFileChangedHandler">
          Choose new file
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  props: {
    msg: String
  },
  data () {
    return {
      isSelecting: undefined,
      selectedFile: undefined
    }
  },
  methods: {
    onNewFileButtonHandler () {
      this.isSelecting = true
      window.addEventListener('focus', () => {
        this.isSelecting = false
      }, { once: true })

      this.$refs.uploader.click()
    },
    onFileChangedHandler (event) {
      this.selectedFile = event.target.files || event.dataTransfer.files;
      if (!this.selectedFile.length) return;
      this.createInput(this.selectedFile[0]);
    },
    createInput (file) {
      let readerResult
      const reader = new FileReader()

      let promise = new Promise((resolve) => {
        reader.onload = () => {
          resolve((readerResult = reader.result))
        }

        reader.readAsText(file)
      })

      promise.then(
        () => {
          this.$store.commit('setFileName', this.selectedFile[0].name)
          this.$store.commit('setFileData', this.convertCSVToJSON(readerResult))
          this.$router.push('Statistics')
        },
        error => {
          console.log(error);
        }
      );
    },
    convertCSVToJSON (csvString, delimiter = ',') {
      const rows = csvString.slice(csvString.indexOf('\n') + 1).split('\n')

      return rows.map(row => {
        const values = row.split(delimiter)

        const date = values[0].includes('-')
          ? new Date(values[0])
          : this.convertISOToUTC(values[0])

        const zone = values[1] && (values[1].includes('+') || values[1].includes('-'))
          ? parseInt(values[1]) / 100
          : undefined

        return {
          date,
          zone
        }
      }).filter(v => v.date)
    },
    convertISOToUTC (isoDate) {
      if (!isoDate) return undefined
      
      const date = new Date()
      date.setFullYear(isoDate.substring(0, 4))
      date.setMonth(isoDate.substring(4, 6))
      date.setDate(isoDate.substring(6, 8))
      date.setHours(isoDate.substring(9, 11))
      date.setMinutes(isoDate.substring(11, 13))
      date.setSeconds(isoDate.substring(13, 15))
      return date
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./../scss/_colors";

#file-upload {
  height: 100%;
  background: linear-gradient(0, white 60%, $cyan 40%);
}

.v-card {
  margin-bottom: 20vh;
}

</style>
