class Request {
   constructor() {
      
      let _BASE_URL = '';
      let _BEFORE_REQUEST = null;
      let _AFTER_REQUEST = null;

      // 设置访问器属性，确保属性类型不会出错
      Object.defineProperties(this, {
         BASE_URL: {
            get:()=>_BASE_URL,
            set:val=>typeof val === 'string' && (_BASE_URL = val)
         },
         BEFORE_REQUEST: {
            get:()=>_BEFORE_REQUEST,
            set:val=>typeof val === 'function' && (_BEFORE_REQUEST = val)
         },
         AFTER_REQUEST: {
            get:()=>_AFTER_REQUEST,
            set:val=>typeof val === 'function' && (_AFTER_REQUEST = val)
         },
      })
   }

   /**
    * @method  setBaseUrl        设置默认地址
    *
    * @param   {String}    url   要设置的url
    */
   setBaseUrl(url) {
      typeof url === 'string' ?
      this.BASE_URL = url :
         console.error('setBaseUrl的参数必须为string类型:',url);
   }

   /**
    * @method  request     发送一个请求
    * @for     Request
    *
    * @param   {String}       url=''      请求的地址
    * @param   {'get'|'post'} type='get'     请求方式
    * @param   {Object}       params={}   请求的参数
    *
    * @return  {Promise}
    */
   request(url='', type='get', params={}) {
      if(this.BASE_URL && url.indexOf('http')!==0)
         url = this.BASE_URL+url;
      return new Promise((success, fail) => {
         new Promise((resolve, reject) => {
            params = JSON.parse(JSON.stringify(params))
            /*请求前处理参数*/
            if (this.BEFORE_REQUEST) {
               let returnVal = this.BEFORE_REQUEST(params);
               returnVal instanceof Promise ?
                  returnVal.then(resolve, reject) :
                  resolve(params)
            } else
               resolve(params);
         }).then(data => {
            wx.request({
                  url: url,
                  method: type || 'get',
                  data,
                  complete:response=> {
                     new Promise((resolve, reject)=>{
                        let {statusCode:code,data:rData} = response;

                        let data = (this.AFTER_REQUEST?
                           this.AFTER_REQUEST(response,{url,type,params}):
                           rData) || rData;

                        data instanceof Promise ?
                           data.then(resolve,reject):
                           code===200?resolve(data):reject(data)
                     }).then(success,fail)
                  },
                  ...data
               }
            );
         },fail)
      })
   }

   /**
    * @method  get     发送一个get请求
    * @for     Request
    *
    * @param   {String}       url=''      请求的地址
    * @param   {Object}       params={}   请求的参数
    *
    * @return  {Promise}
    */
   get(url='', params={}) {
      return this.request(url, 'get', params)
   }

   /**
    * @method  post     发送一个post请求
    * @for     Request
    *
    * @param   {String}       url=''      请求的地址
    * @param   {Object}       params={}   请求的参数
    *
    * @return  {Promise}
    */
   post(url='', params={}) {
      return this.request(url, 'post', params)
   }

   /**
    * @param {Function} func - 设置请求前的回调函数
    * @for     Request
    *
    * 设置一个唯一的请求前回调，当发送一个新的请求时，请求参数会被传入此回调函数，如果回调函数返回值是Object,会覆盖原有的参数作为请求体，如果回调函数是Promise，会在该then后发送请求并使用then回调的参数作为请求体；
    *
    * 回调函数接收一个参数，为请求参数
    */
   beforeRequest(func) {
      typeof func === 'function' ?
         this.BEFORE_REQUEST = func :
         console.error('beforeRequestl的参数必须为function类型:',func);
   }


   /**
    * @param {Function} func - 设置请求响应后回调函数
    * @for     Request
    *
    * 设置一个唯一的请求完成后回调，当请求得到响应时，响应内容会被传入此回调函数，如果回调函数返回值是Object,会覆盖原有的参数作为响应参数，如果回调函数是Promise，会在该then后发送请求并使用then回调的参数作为响应参数
    *
    * 回调函数接收两个个参数，第一个参数为响应内容，第二个为请求数据，包含url（请求地址），type（请求类型），params（请求参数）
    */
   afterRequest(func) {
      typeof func === 'function' ?
         this.AFTER_REQUEST = func :
         console.error('afterRequest的参数必须为function类型:',func);
   }

}


export default new Request();

