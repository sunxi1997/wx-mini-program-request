class Request {
   constructor() {
      this.BASE_URL = '';
      this._BEFORE_REQUEST = null;
      this._AFTER_REQUEST = null;
   }

   /**
    * @method  setBaseUrl        设置默认地址
    *
    * @param   {String}    url   要设置的url
    */
   setBaseUrl(url) {
      this.BASE_URL = url;
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
      if(this.BASE_URL)
         url = this.BASE_URL+url;
      return new Promise((success, fail) => {
         new Promise((resolve, reject) => {
            /*请求前处理参数*/
            if (this._BEFORE_REQUEST) {
               let returnVal = this._BEFORE_REQUEST(params);
               returnVal instanceof Promise ?
                  returnVal.then(resolve, reject) :
                  resolve(params)
            } else
               resolve(params);
         }).then(params => {
            wx.request({
                  url: url,
                  method: type || 'get',
                  data: params,
                  complete:response=> {
                     new Promise((resolve, reject)=>{
                        let {statusCode:code,data:rData} = response;

                        let data = (this._AFTER_REQUEST?
                           this._AFTER_REQUEST(response):
                           rData) || rData;

                        data instanceof Promise ?
                           data.then(resolve,reject):
                           code===200?resolve(data):reject(data)
                     }).then(success,fail)
                  },
                  ...params
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
    * @param {Function} func - 在所有请求发送前会进行拦截并调用此函数,可在此对所有请求的参数做判断修改
    * @for     Request
    */
   beforeRequest(func) {
      typeof func === 'function' &&
      (this._BEFORE_REQUEST = func)
   }


   /**
    * @param {Function} func - 在所有请求响应后会使用此回调，可在此对所有响应结果做处理
    * @for     Request
    */
   afterRequest(func) {
      typeof func === 'function' &&
      (this._AFTER_REQUEST = func)
   }

}


export default new Request();

