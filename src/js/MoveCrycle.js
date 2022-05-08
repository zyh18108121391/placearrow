/***
 * 放大缩小数字变化类
 * 根据放大缩小初始值和步长等递增
 * 提供到达某一数值时的回调
 * @params {Number} from 数字初始值
 * @params {Number} to 数字最大值
 * @params {Number} step 数字步长
 * @params {Array} dingNums 达到dingNums的区间触发回调 只再放大轮回触发
 */
export default class MoveCrycle {
  constructor({ from = 0, to = 100, step = 1, dingNums = [] }) {
    this.from = from;
    this.to = to;
    this.step = step;
    this.dingNums = dingNums;

    this.currValue = this.from;
    this._turnNum = 0; //放大缩小轮次 一次放大一次缩小为一轮
    this._event = {
      onchange: [], //每一次变化触发的回调
      onlarge: [], //每次到最大值触发的回调
      onsmall: [], //每次到最小值触发的回调
      onding: [], //每次到dingNums区间值时触发的回调
    };
    this._init();
  }
  _init() {
    //订阅放大事件
    //记录轮次 每次放大+1
    this.on("onlarge", function turn() {
      this._turnNum++;
    });
  }
  //开始滚动数字
  jump() {
    if (this.step > 0) {
      //放大过程
      if (this.currValue <= this.to) {
        //递增过程中
        this.currValue += this.step;
        //判断是否在dingNums区间
        if (
          this.currValue >= this.dingNums[0] &&
          this.currValue <= this.dingNums[1]
        ) {
          this._emit("onding", this.currValue, this._turnNum);
        }
      } else {
        this._emit("onsmall", this.currValue);
        this.currValue = this.to;
        this.step *= -1;
      }
    } else {
      //缩小过程
      if (this.currValue > this.from) {
        this.currValue += this.step;
      } else {
        //缩到初始值了 重新放大
        this.step *= -1;
        this.currValue = this.from;
        this._emit("onlarge", this.currValue);
      }
    }
    this._emit("onchange", this.currValue, this.step > 0, this._turnNum);
  }
  //触发事件函数
  _emit(type, ...args) {
    //触发每次变动函数
    this._event[type].forEach((f) => {
      try {
        f.apply({}, args);
      } catch (e) {
        console.error(e);
      }
    });
  }

  //订阅回调
  on(type, func) {
    if (
      this._event[type] &&
      !this._event[type].filter((f) => f === func).length
    ) {
      this._event[type].push(func);
    }
  }
  //注销回调
  off(type, func) {
    if (this._event[type]) {
      this._event[type] = this._event[type].filter((f) => f !== func);
    }
  }
}
