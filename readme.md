# Request

封装微信请求

## 安装

````
npm install wx-mini-program-request
````

## 使用

````
// app.js

import Request from 'wx-mini-program-request'

Request.setBaseUrl('https://www.xxx.com/api/'); // 设置你的服务器接口地址

// 其他页面

// get 请求
Request.get('api1',{id:1}).then(res=>{

});

Request.post(...)

Request.request(...)
````

## 内置属性

内置属性被设置了访问器属性，类型已固定

属性              | 类型    | 修改方法 | 说明
 ---             |---       |---    |---    
BASE_URL         |String   |  setBaseUrl  | 请求url的前缀，若地址不是http开头的，都会加上此前缀
BEFORE_REQUEST   |Function | beforeRequest | 请求前的回调，请求发送前会被此函数拦截，可在回调内对请求做处理，详见方法 beforeRequest
AFTER_REQUEST    |Function | afterRequest |请求完成后的回调，请求得到响应后会被此函数拦截，可在回调内对响应做处理，详见方法 afterRequest

## 方法

#### setBaseUrl(url)
````
@param   {String}    url   要设置的url
````

#### request(url,type,params)
````
 @param   {String}        url=''      请求的地址
 @param   {'get'|'post'}  type='get'     请求方式
 @param   {Object}        params={}   请求的参数

 @return  {Promise}
````

### get(url,params)

````
 @param   {String}        url=''      请求的地址
 @param   {Object}        params={}   请求的参数

 @return  {Promise}
 
 等同于request(url,'get',params)
````


### post(url,params)

````
 @param   {String}        url=''      请求的地址
 @param   {Object}        params={}   请求的参数

 @return  {Promise}
 
 等同于request(url,'post',params)
````

### beforeRequest(callback)

````
@param {Function} callback - 请求前回调
````
设置一个唯一的请求前回调，当发送一个新的请求时，请求参数会被传入此回调函数，如果回调函数返回值是Object,会覆盖原有的参数作为请求体，如果回调函数是Promise，会在该then后发送请求并使用then回调的参数作为请求体；

回调函数接收一个参数，为请求参数

### afterRequest(callback)

````
@param {Function} callback - 请求前回调
````
设置一个唯一的请求完成后回调，当请求得到响应时，响应内容会被传入此回调函数，如果回调函数返回值是Object,会覆盖原有的参数作为响应参数，如果回调函数是Promise，会在该then后发送请求并使用then回调的参数作为响应参数；


回调函数接收两个个参数，第一个参数为响应内容，第二个为请求时携带的参数

## 示例

需求：

使用Request时：

1 如果请求体包含_loading:true,那么在请求前，展示loading，响应后关闭loading；实际请求参数不包含_loading字段

2 如果请求体包含_user:true,那么在请求参数中加入User的用户数据中的user_id和token(用户数据是异步获得的);实际请求参数不包含_user字段

3 若服务器响应的内容不是JSON数据，作请求失败处理

4 若服务器响应的JSON数据中status不为1，作请求失败处理

5 若服务器响应成功，将响应JSON内容的data做响应结果

`````
import Request from 'wx-mini-program-request'
import User from 'wx-mini-program-user'
(() => {

   /*设置接口地址*/
   Request.setBaseUrl(API_URL)

   /*设置请求前回调*/
   Request.beforeRequest(params => {

      /*是否使用 loading*/
      if (params._loading === true) {
         delete params._loading
         wx.showNavigationBarLoading();
      }

      /*是否要携带用户数据*/
      if (params._user === true){
         delete params._user;
         return new Promise(resolve =>
            User.getUserInfo().then(({user_id,user_token})=>
               resolve(Object.assign({user_id,user_token},params))))
      }

   });

   /*设置请求完成回调*/
   Request.afterRequest(response => {
      return new Promise((resolve, reject) => {
         /*关闭 navbar loading*/
         wx.hideNavigationBarLoading();

         let {statusCode, data} = response;
         /*响应码为200 状态码为1 才算请求成功*/
         if (
            statusCode === 200 &&
            typeof data === 'object' &&
            data.status === 1
         )
            resolve(data.data)
         /*否则报错*/
         else {
            console.error(typeof data === 'object' ? data.msg : '服务器错误！');
            reject();
         }
      })
   });

})();
`````