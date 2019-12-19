export function stateName (state) {
    if (state instanceof String || typeof state === 'string') {
        return state;
    } else if (state.hasOwnProperty('parent') && state.parent) {
        let pname = stateName(state.parent);
        if (state.name.indexOf(pname) == -1) {
        return pname + '.' + state.name;
      } else {
        return state.name;
      }
    } else {
      return state.name;
    }
  }
  
  export function stateNameWithParent (name, parent) {
    return stateName({name, parent});
  }
 // toFixed 修复
 export function toFixed(num, s) {
     let times = Math.pow(10, s)
     let des = num * times + 0.5
     des = parseInt(this.des, 10) / times
     return des + ''
 }
 export const weekList =  ["日", "一", "二", "三", "四", "五", "六"];