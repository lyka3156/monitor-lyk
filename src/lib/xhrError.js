import { tracker } from '../utils';

/**
 * 拦截接口XHR请求          （fetch没有拦截）  *****  TODO:   后续可以实现一个拦截fetch请求的
 * 实现： 接口异常采集脚本  
 * https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
 */
export function injectXHRError() {
    let XMLHttpRequest = window.XMLHttpRequest;
    // 1. 拿到旧的初始化请求的open方法
    let oldOpen = XMLHttpRequest.prototype.open;


    // 2. 拦截open方法，定义哪些接口需要拦截
    XMLHttpRequest.prototype.open = function (method, url, async) {
        // 2.1 定义一个标识，对哪些接口实现接口拦截
        // 过滤掉logstores的云服务器接口和sockjs的webpack请求       ***** TODO: 这里面可以由用户配置，拦截哪些接口 
        if (!url.match(/logstores/) && !url.match(/sockjs/)) {
            this.logData = { method, url, async }
        }
        // 2.2 初始化请求
        return oldOpen.apply(this, arguments);
    }
    // 3. 拿到旧的发送请求的send方法
    let oldSend = XMLHttpRequest.prototype.send;

    // 4. 拦截send方法，实现接口监控采集上报
    XMLHttpRequest.prototype.send = function (body) {
        // 4.1 需要接口上报集采的接口
        if (this.logData) {
            let start = Date.now();
            let handler = (event) => {
                let duration = Date.now() - start;    // 计算接口耗时
                let status = this.status;   // 获取状态code     200/304/500 ...
                let statusText = this.statusText;   // 获取状态tetext OK/Internal Server Error ...
                // 4.2 接口埋点上报
                tracker.send({
                    kind: 'stability',//稳定性指标
                    type: 'xhr',// 接口类型
                    eventType: event.type,   // 接口请求的状态 load error abort
                    pathname: this.logData.url,// 接口的url地址
                    status: status + "-" + statusText,  // 状态code + 状态text
                    duration, //接口耗时
                    response: this.response ? JSON.stringify(this.response) : "",   // 响应体
                    params: body || ''       // 请求体
                })
            }
            // 监听接口请求的状态   https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/error_event
            // loadstart, load, loadend, progress, error,  abort

            // load  只要服务器请求通了，就执行， 200，300，404，500 都会触发
            this.addEventListener('load', handler);
            // error 只有当服务器请求不通，才执行   
            this.addEventListener('error', handler);
            // abort 只有当接口请求中断才会执行
            this.addEventListener('abort', handler);
        }
        // 4.3 真正发送请求的地方
        oldSend.apply(this, arguments);
    };
}