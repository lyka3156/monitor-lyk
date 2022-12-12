// 1. js promise 资源加载错误监控
import { injectJsError } from './lib/jsError';
// 2. 接口监控
import { injectXHRError } from './lib/xhrError';
// 3. 白屏监控
import { blankScreen } from './lib/blankScreen';

injectJsError();
injectXHRError();
blankScreen();
