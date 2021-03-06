
import fetch from 'isomorphic-fetch'
import fetchJsonp from 'fetch-jsonp';
import reverbListings2JC from '../utilities.js'
import ebayListings2JC from '../ebay.js'

//const REVERB_QUERY = `https://reverb.com/api/listings?query=%PROD%&conditions=b-stock&make=fender&page=1&per_page=24`
const REVERB_QUERY = `https://reverb.com/api/listings?query=%PROD%&page=1&per_page=24`
const EBAY_QUERY = " http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=MikeMaho-Sample-PRD-a2f518278-9a7b8b03&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=24&keywords=%PROD%&categoryId=619&descriptionSearch=true&callbackname=jsonpcallback"

let nextTodoId = 0
export const loadProducts = (text) => {
  return {
    type: 'LOAD_PRODUCT',
    text
  }
}

export const addSearch = (searchKey, searchResults) => {
  return {
    type: 'ADD_SEARCH',
    searchKey: searchKey,
    searchResults
  }
}

export const setSort = (sortOrder) => {
  return {
    type: 'SET_SORT',
    sort: sortOrder
  }
}

export const setHistory = (newSearch) => {
  return {
    type: 'SET_HISTORY',
    newSearch: newSearch
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}


//export const REQUEST_POSTS = 'REQUEST_POSTS'
function requestPosts(subreddit, sortOrder) {
  return {
    type: 'REQUEST_POSTS',
    sort: sortOrder,
    subreddit
  }
}

//export const RECEIVE_POSTS = 'RECEIVE_POSTS'
function receivePosts(subreddit, json) {
  var JCPosts = reverbListings2JC(json.listings);

  return {
    type: 'RECEIVE_POSTS',
    subreddit,
    posts: JCPosts,
    receivedAt: Date.now()
  }
}

// Meet our first thunk action creator!
// Though its insides are different, you would use it just like any other action creator:
// store.dispatch(fetchPosts('reactjs'))

export function fetchPosts(product) {

  return function (dispatch) {


    dispatch(requestPosts(product))

    var queryUrl = REVERB_QUERY.replace('%PROD%', product);  // TODO urlencode product

    return fetch(queryUrl)
      .then(response => response.json())
      .then(json =>

        dispatch(receivePosts(product, json))
      )
  }
}

export function fetchEbayPosts(product) {

  return function (dispatch) {


    dispatch(requestPosts(product))

    var queryUrl = EBAY_QUERY.replace('%PROD%', product);  // TODO urlencode product

    return fetchJsonp(queryUrl, {
      method: 'GET',
      mode: 'no-cors',
    })
      .then(response => response.json())
      .then(response => dispatch(receiveEbayPosts(product, response.findItemsAdvancedResponse[0].searchResult[0].item)))
  }
}

function receiveEbayPosts(product, json) {
  var EBPosts = ebayListings2JC(json);

  return {
    type: 'RECEIVE_POSTS',
    product,
    posts: EBPosts,
    receivedAt: Date.now()
  }

}

export function setSortOrder(order) {
  return function (dispatch) {
    dispatch(setSort(order))
  }
}

export function setNewHistory(newSearch) {
  return function (dispatch) {
    dispatch(setHistory(newSearch))
  }
}
