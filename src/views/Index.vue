<template>
  <div class="index">
    <div :class="['banner', status]">
      <div :class="['banner-text', status]">
        <span :class="['title', status]">AMe</span><span :class="['sub-title', status]"> - CNKI Knowledge Search</span>
      </div>
      <div :class="['search-box', status]">
        <q-search v-model="qs" color="white" :dark="true" placeholder="You know, for Search" :before="[{
          icon: 'library books'
        }]" :after="[{
          icon: 'delete',
          content: true,
          handler: clear
        }]" :disabled="!searchAvailability" style="float: left; margin-right: 10px; min-width: 25%"/>
        <q-btn outline @click="generalSearch()" small :disabled="qs.length === 0" style="margin: 16px 0"><q-icon name="search" style="margin-right: 5px; font-size: 18px"></q-icon>Go!</q-btn>
      </div>
    </div>
    <div :class="['data-view', status]">
      <q-card v-for="(publication, index, arr) in publications" :key="index" class="data-card">
        <q-card-title class="data-card-title"  @click="detailModal = true; selectedPublication = publication;">
          {{lget(publication.title)}}
          <span slot="subtitle">{{lget(publication.abstract)}}</span>
        </q-card-title>
        <q-card-separator v-if="publication.topics.length > 0"/>
        <q-card-actions v-if="publication.topics.length > 0">
          <div class="card-action-container">
            <q-btn small outline v-for="(topic, subIndex) in publication.topics" :key="subIndex" @click="generalSearch(topic)">
              {{topic}}
            </q-btn>
            <span class="card-action-identifier">{{lget(labels.topics)}}</span>
          </div>
        </q-card-actions>
        <q-card-separator v-if="publication.keywords.length > 0"/>
        <q-card-actions v-if="publication.keywords.length > 0">
          <div class="card-action-container">          
            <q-btn small outline v-for="(keyword, subIndex) in publication.keywords" :key="subIndex" @click="generalSearch(lget(keyword))">
              {{lget(keyword)}}
              <q-tooltip v-if="lget_(keyword) !== lget(keyword)">{{lget_(keyword)}}</q-tooltip>
            </q-btn>
            <span class="card-action-identifier">{{lget(labels.keywords)}}</span>            
          </div>
        </q-card-actions>
        <q-card-separator v-if="publication.authors.length > 0"/>
        <q-card-actions v-if="publication.authors.length > 0">
          <div class="card-action-container">                    
            <q-btn small outline rounded v-for="(author, subIndex) in publication.authors" :key="subIndex" @click="generalSearch(lget(author))"><q-icon v-if="lget(author) === lget(publication.firstPerson)" name="supervisor account"/>
              {{lget(author)}}
              <q-tooltip v-if="lget_(author) !== lget(author)">{{lget_(author)}}</q-tooltip>              
            </q-btn>
            <span class="card-action-identifier">{{lget(labels.authors)}}</span>            
          </div>
        </q-card-actions>
      </q-card>
    </div>
    <div class="background">
      <div :class="['background-upper', status]"></div>
      <div :class="['background-lower', status]"></div>
    </div>
    <div class="tools">
      <q-btn rounded @click="changeLang" :color="lget(langTool)">{{lget(langText)}}</q-btn>
    </div>
    <q-modal v-model="detailModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-modal-layout v-if="selectedPublication">
        <q-toolbar slot="header">
          <q-btn flat @click="detailModal = false">
            <q-icon name="keyboard_arrow_left" />
          </q-btn>
          <div class="q-toolbar-title">
            {{ selectedPublication.filename }}
          </div>
        </q-toolbar>
        <q-toolbar slot="footer">
          <div class="q-toolbar-title">
            ISSN: {{selectedPublication.ISSN}} CN: {{selectedPublication.CN}}
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <h5>{{lget(selectedPublication.title)}}</h5>
          <h6>{{lget(labels.abstract) + ": " + lget(selectedPublication.abstract)}}</h6>
          <q-card-separator/>
          <h6>{{lget(labels.topics) + ": " + selectedPublication.topics.join("; ")}}</h6>
          <h6>{{lget(labels.keywords) + ": " + selectedPublication.keywords.map(w => lget(w)).join("; ")}}</h6>
          <h6>{{lget(labels.authors) + ": " + selectedPublication.authors.map(w => lget(w)).join("; ")}}</h6>
          <q-card-separator/>
          <h6>{{lget(labels.firstPerson) + ": " + lget(selectedPublication.firstPerson)}}</h6>
          <h6>{{lget(labels.org) + ": " + lget(selectedPublication.org)}}</h6>
          <h6>{{lget(labels.src) + ": " + lget(selectedPublication.src)}}</h6>
          <h6>{{lget(labels.publisher) + ": " + lget(selectedPublication.publisher)}}</h6>
          <h6>{{lget(labels.publishDate) + ": " + selectedPublication.publishDate}}</h6>
          <q-card-separator/>
          <h6>类别: {{selectedPublication.category}} / {{selectedPublication.categoryNumber}}</h6>
          <h6>语言: {{selectedPublication.lang}}</h6>
          <q-card-separator/>
          <h6>{{lget(labels.table) + ": " + selectedPublication.table}}</h6>
          <h6>{{lget(labels.volume) + ": " + selectedPublication.volume}}</h6>
          <h6>{{lget(labels.year) + ": " + selectedPublication.year}}</h6>
        </div>
      </q-modal-layout>
    </q-modal>
  </div>
</template>

<script>
import {
  QSearch,
  QCard,
  QCardTitle,
  QBtn,
  QIcon,
  QToggle,
  QCardActions,
  QCardSeparator,
  QTooltip,
  QModal,
  QModalLayout,
  QToolbar
} from 'quasar'
import api from '../search/api.js'
import _ from 'lodash'
import languagePackage from '../language-package'
export default {
  name: 'index',
  components: {
    QSearch,
    QCard,
    QCardTitle,
    QBtn,
    QIcon,
    QToggle,
    QCardActions,
    QCardSeparator,
    QTooltip,
    QModal,
    QModalLayout,
    QToolbar
  },
  computed: {
  },
  data () {
    return {
      qs: '',
      publications: [],
      status: 'front',
      searchAvailability: true,
      lang: 'zh',
      lang_default: 'en',
      detailModal: false,
      selectedPublication: null,
      ...languagePackage
    }
  },
  methods: {
    generalSearch (queryString = null) {
      if (!_.isEmpty(queryString)) this.qs = queryString
      this.searchAvailability = false
      api.generalSearch(this.qs, 0, 20).then(result => {
        this.searchAvailability = true
        this.publications.splice(0, this.publications.length, ...result.data)
        this.status = 'expand'
      }).catch(err => {
        console.error(err)
        this.searchAvailability = true
        this.status = 'front'
      })
    },
    clear () {
      this.qs = ''
      this.publications.splice(0, this.publications.length)
      this.status = 'front'
    },
    changeLang () {
      if (this.lang === 'zh') {
        this.lang = 'en'
        this.lang_default = 'zh'
      }
      else {
        this.lang = 'zh'
        this.lang_default = 'en'
      }
    },
    lget (obj) {
      return _.isEmpty(obj[this.lang]) ? obj[this.lang_default] : obj[this.lang]
    },
    lget_ (obj) {
      return _.isEmpty(obj[this.lang_default]) ? obj[this.lang] : obj[this.lang_default]
    }
  }
}
</script>

<style>
.index {
  height: 100%;
  width: 100%;
}
.index div, span {
  transition: all 0.75s;
}
.banner {
  background: linear-gradient(to top, rgba(133, 171, 247, 0), rgba(33, 42, 140, 0.5));
  width: 100%;
  position: fixed;
  color: white;
  z-index: 500;
}
.banner.front {
  height: 50%;
  font-size: 44px;
}
.banner.expand {
  height: 10%;
  font-size: 24px;
}
.banner-text {
  position: relative;
  float: left;
}
.banner-text.front {  
  left: 50%;
  top: 70%;
  transform: translate(-50%, -50%);
  margin: 0px;
}
.banner-text.expand {
  left: calc(100% - 20px);
  top: 50%;
  transform: translate(-110%, -50%);
}
.search-box {
  position: absolute;
  float: left;
}
.search-box.front {
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5, 1.5);
}
.search-box.expand {
  top: 50%;
  left: 20px;
  transform: translate(10%, -50%)
}
.title.front {
  font-weight: 600;
  font-size: 84px;
  margin-right: 10px;
}
.title.expand {
  font-weight: 500;
  font-size: 26px;
  margin-right: 5px;
}
.sub-title.front {
  font-size: 44px;
}
.sub-title.expand {
  font-size: 24px;
}
.data-view {
  padding: 20px 8% 20px 8%;
  width: 100%;
  position: relative;
}
.data-view.front {
  top: 50%;
  height: 50%;
}
.data-view.expand {
  top: 10%;
  height: 90%;
}
.background {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  /* background: linear-gradient(to bottom, #526996, #aac0ed); */
}
.background-upper {
  background: linear-gradient(to top, rgba(133, 171, 247, 1), rgba(33, 42, 140, 0.5));
}
.background-upper.front {
  height: 50%;
}
.background-upper.expand {
  height: 10%;
}
.background-lower {
  background: linear-gradient(to bottom, #85abf7, #aac0ed);  
}
.background-lower.front {
  height: 50%;
  top: 50%;
}
.background-lower.expand {
  height: 90%;
  top: 10%;
}
.tools {
  position: fixed;
  bottom: 50px;
  right: 50px;
}
.language-helper div{
  margin: 0 5px;
  transition: all .25s;
}
.data-card {
  background: rgba(54, 54, 132, 0.4);
  color: white;
}
.data-card-title {
  border: solid transparent 3px;
}
.data-card-title:hover {
  background: rgba(54, 54, 132, 0.7);
  border: solid rgba(54, 54, 132, 0.75) 3px;
  cursor: pointer;
}
.data-card span {
  color: rgba(255, 255, 255, 0.8)
}
.card-action-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 10px;
}
.card-action-container div:hover {
  cursor: pointer;
}
.card-action-identifier {
  position: absolute;
  right: 10px;
  font-style: italic;
  opacity: 0.7;
}
</style>

