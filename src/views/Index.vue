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
        }]" :disabled="!searchAvailability" style="float: left; margin-right: 10px; min-width: 25%" @keyup.enter="generalSearch()"/>
        <q-btn outline @click="generalSearch()" small :disabled="qs.length === 0" style="margin: 16px 0"><q-icon name="search" style="margin-right: 5px; font-size: 18px"></q-icon>Go!</q-btn>
        <q-btn outline round @click="advanceQuery.visibility = true" small style="margin: 0; transform: scale(0.7, 0.7)" icon="build"></q-btn>
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
      <q-btn rounded @click="changeAnalyzer" :color="analyzerColor">{{analyzer}}</q-btn>
      <q-btn rounded @click="strict = !strict" :color="strict ? 'purple-5' : 'deep-purple-5'">{{strict ? lget(labels.strictMode) : lget(labels.looseMode)}}</q-btn>
    </div>
    <div class="paging" v-if="paging.total > 0">
      <q-btn color="tertiary" class="left-arrow"><q-icon name="keyboard arrow left" @click="goToPreviousPage"/></q-btn>
      <div class="page-cursor" style="display: inline-flex;position: relative;float: left;">
        <q-btn color="tertiary" @click="changePageInputVisibility">
          Page:&nbsp;<span v-show="!inputs.pageInputVisible" style="padding: 0 12px">{{paging.page}}</span>
          <span v-show="inputs.pageInputVisible">
            <!-- <input class="page-number-input" @click.stop @input.prevent="inputPageNumber" v-model="inputs.targetPage" placeholoder="Page Number"/> -->
            <q-input @click.stop v-model="inputs.targetPage" style="padding: 0;margin: 0;width: 40px" align="center" color="white" :dark="true" type="number" @keyup.enter="goToPage(inputs.targetPage)"/>
          </span>
          &nbsp;/ {{paging.count}}
        </q-btn>
        <div class="popover">
          <q-btn v-for="(n, index) in pageNavigator" :key="index" color="tertiary" @click="goToPage(n)">{{n}}</q-btn>
        </div>
      </div>
      <q-btn color="tertiary" class="right-arrow"><q-icon name="keyboard arrow right" @click="goToNextPage"/></q-btn>
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
    <q-modal v-model="advanceQuery.visibility" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn flat @click="advanceQuery.visibility = false"><q-icon name="keyboard_arrow_left" /></q-btn>
          <div class="q-toolbar-title">{{ lget(labels.advanceSearch) }}</div>
        </q-toolbar>
        <div class="layout-padding">
          <q-field :label="lget(labels.title)"><q-input v-model="advanceQuery.values.title" /></q-field>
          <q-field :label="lget(labels.abstract)"><q-input v-model="advanceQuery.values.abstract" /></q-field>
          <q-field :label="lget(labels.topics)"><q-input v-model="advanceQuery.values.topics" /></q-field>
          <q-field :label="lget(labels.keywords)"><q-input v-model="advanceQuery.values.keywords" /></q-field>
          <q-field :label="lget(labels.authors)"><q-input v-model="advanceQuery.values.authors" /></q-field>
          <q-field :label="lget(labels.src)"><q-input v-model="advanceQuery.values.src" /></q-field>
          <q-field :label="lget(labels.publisher)"><q-input v-model="advanceQuery.values.publisher" /></q-field>
          <q-field :label="lget(labels.publishDate)"><q-input v-model="advanceQuery.values.publishDate" /></q-field>
          <q-field :label="lget(labels.org)"><q-input v-model="advanceQuery.values.org" /></q-field>
          <q-field :label="lget(labels.year)"><q-input v-model="advanceQuery.values.year" /></q-field>
          <q-btn color="primary" style="position: absolute; bottom: 30px; right: 30px;" @click="advanceSearch()">Go!</q-btn>
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
  QToolbar,
  QPopover,
  QList,
  QItem,
  QInput,
  QField
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
    QToolbar,
    QPopover,
    QList,
    QItem,
    QInput,
    QField
  },
  computed: {
    analyzerColor () {
      switch (this.analyzer) {
        case 'IKAnalyzer': return 'positive'
        case 'StandardAnalyzer': return 'info'
        case 'JcsegAnalyzer': return 'warning'
        default: return 'negative'
      }
    },
    pageNavigator () {
      return _.filter(
        _.sortedUniq(_.union(
          _.range(1, 4),
          _.range(this.paging.page - 2, this.paging.page + 3),
          _.range(this.paging.count - 2, this.paging.count + 1)
        )), i => (i > 0 && i <= this.paging.count))
    }
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
      analyzer: 'IKAnalyzer',
      strict: false,
      inputs: {
        targetPage: 1,
        pageInputVisible: false
      },
      paging: {
        skip: 0,
        limit: 10,
        page: 1,
        count: 1,
        total: 0
      },
      advanceQuery: {
        visibility: false,
        values: {
          title: '',
          abstract: '',
          topics: '',
          keywords: '',
          authors: '',
          src: '',
          publisher: '',
          publishDate: '',
          org: '',
          year: ''
        }
      },
      ...languagePackage
    }
  },
  methods: {
    updatePaging (total) {
      if (total === 0) this.paging.skip = 0
      this.paging.total = total
      this.paging.count = Math.ceil(total / this.paging.limit)
      this.paging.page = Math.floor(this.paging.skip / this.paging.limit) + 1
      this.inputs.targetPage = this.paging.page
    },
    goToPage (page) {
      page = Math.max(Math.min(page, this.paging.count), 1)
      if (this.paging.page === page) return
      this.paging.page = page
      this.paging.skip = (page - 1) * this.paging.limit
      this.generalSearch()
    },
    changePageInputVisibility () {
      this.inputs.pageInputVisible = !this.inputs.pageInputVisible
      this.inputs.targetPage = this.paging.page
    },
    goToPreviousPage () { this.goToPage(this.paging.page - 1) },
    goToNextPage () { this.goToPage(this.paging.page + 1) },
    generalSearch (queryString = null) {
      if (!_.isEmpty(queryString)) {
        this.qs = queryString
        this.updatePaging(0)
      }
      this.searchAvailability = false
      api.generalSearch(this.qs, this.paging.skip, this.paging.limit, this.analyzer, this.strict).then(result => {
        this.searchAvailability = true
        this.updatePaging(result.data.total)
        this.publications.splice(0, this.publications.length, ...result.data.data)
        this.status = 'expand'
      }).catch(err => {
        console.error(err)
        this.searchAvailability = true
        this.publications.splice(0, this.publications.length)
        this.status = 'front'
      })
    },
    search (query) {
      this.updatePaging(0)
      this.searchAvailability = false
      api.search(query, this.paging.skip, this.paging.limit, this.analyzer).then(result => {
        this.searchAvailability = true
        this.updatePaging(result.data.total)
        this.publications.splice(0, this.publications.length, ...result.data.data)
        this.status = 'expand'
      }).catch(err => {
        console.error(err)
        this.searchAvailability = true
        this.publications.splice(0, this.publications.length)
        this.status = 'front'
      })
    },
    clear () {
      this.qs = ''
      this.publications.splice(0, this.publications.length)
      this.status = 'front'
      this.updatePaging(0)
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
    changeAnalyzer () {
      switch (this.analyzer) {
        case 'IKAnalyzer':
          this.analyzer = 'StandardAnalyzer'
          break
        case 'StandardAnalyzer':
          this.analyzer = 'JcsegAnalyzer'
          break
        case 'JcsegAnalyzer':
          this.analyzer = 'CJKAnalyzer'
          break
        case 'CJKAnalyzer':
          this.analyzer = 'IKAnalyzer'
          break
        default:
          this.analyzer = 'IKAnalyzer'
          break
      }
    },
    lget (obj) {
      return _.isEmpty(obj[this.lang]) ? obj[this.lang_default] : obj[this.lang]
    },
    lget_ (obj) {
      return _.isEmpty(obj[this.lang_default]) ? obj[this.lang] : obj[this.lang_default]
    },
    advanceSearch () {
      this.advanceQuery.visibility = false
      const fields = {
        title: true, abstract: true, topics: false, keywords: true, authors: true, src: true, publisher: true, publishDate: false, org: true
      }
      let midResult = _.map(fields, (value, key) => { return this.advanceSearchGenerator(key, value) })
      let year = this.advanceQuery.values.year
      if (!_.isEmpty(year)) midResult.push(`(year:[${year} TO ${year}])`)
      let query = midResult.filter(v => v.length > 0).join(this.strict ? ' AND ' : ' OR ')
      if (_.isEmpty(query)) return
      this.search(query)
    },
    advanceSearchGenerator (field, i18n) {
      const subQuery = this.advanceQuery.values[field]
      if (!_.isEmpty(subQuery)) return i18n ? `(${field}_zh:"${subQuery}" OR ${field}_en:"${subQuery}")` : `(${field}:"${subQuery}")`
      else return ''
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
  transition-property: width, height, background-color, font-size, transform, left, right, top, bottom; 
  transition-duration: 0.75s;
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
  opacity: 0.8;
}
.tools:hover {
  opacity: 1;
}
.paging {
  position: fixed;
  bottom: 50px;
  left: 50px;
  opacity: 0.8;
  border-radius: 0;
}
.paging:hover {
  opacity: 1;
}
.paging button {
  float: left;
}
.paging .left-arrow {
  border-radius: 25px 0 0 25px;
}
.paging .right-arrow {
  border-radius: 0 25px 25px 0;
}
.paging .popover {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  transform: translate(0, -100%);
}
.paging .popover button {
  width: 100%;
}
.paging .page-cursor > .popover {
  visibility: hidden;
}
.paging .page-cursor:hover > .popover {
  visibility: visible;
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
.page-number-input {
  padding: 0;
  margin: 0;
  float: left;
  background: transparent;
  border: 0;
  outline: none;
  text-align: center;
  color: white;
}
.page-number-input:focus {
  border: 0;
  outline: none;
}
</style>

