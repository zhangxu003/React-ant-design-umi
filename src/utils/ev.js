/**
 * 组件间消息通信
 * Facebook's EventEmitter is a simple emitter implementation that prioritizes speed and simplicity. It is conceptually similar to other emitters like Node's EventEmitter, but the precise APIs differ. More complex abstractions like the event systems used on facebook.com and m.facebook.com can be built on top of EventEmitter as well DOM event systems.
 *
 * 参考文档：https://github.com/facebook/emitter
 */
import { EventEmitter } from 'events';

export default new EventEmitter();
