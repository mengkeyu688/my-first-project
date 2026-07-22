import { useStore, mapActions } from 'vuex';

export function useMapActions(moduleName, mapper){
    // store独享
    const store = useStore()
    // 获取对应 module 的内容
    const storeActionFns = mapActions(moduleName, mapper)
    // 数据映射
    const newActions = {}
    Object.keys(storeActionFns).forEach(key => {
      newActions[key] = storeActionFns[key].bind({ $store: store })
    })

    return newActions
}