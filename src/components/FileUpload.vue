<template>
  <div id="file-upload" class="d-flex align-center">
    <v-card class="mx-auto" max-width="450px">
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="headline">Please upload your time series data</v-list-item-title>
        <v-list-item-subtitle class="mt-2" v-if="$store.getters.fileData">
          You have already uploaded the file <b>{{ $store.getters.fileName }}</b>
        </v-list-item-subtitle>
        <v-list-item-subtitle class="mt-2" v-else>
          No file has been uploaded
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions class="justify-center">
      <v-btn v-if="$store.getters.fileData" color="red darken-1" text to="/statistics">Show Current Data</v-btn>
      <v-btn color="red" dark>Choose new file</v-btn>
    </v-card-actions>
  </v-card>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  props: {
    msg: String
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

.headline {
  white-space: normal!important;
}

</style>
