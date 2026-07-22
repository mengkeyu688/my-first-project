import { useStore, mapMutations } from 'vuex';

export function useMapMutaions(moduleName, mapper){
    // store独享
    const store = useStore()
    // 获取对应 module 的内容
    const storeMutationFns = mapMutations(moduleName, mapper)
    // 数据映射
    const newMutations = {}
    Object.keys(storeMutationFns).forEach(key => {
        newMutations[key] = storeMutationFns[key].bind({ $store: store })
    })

    return newMutations
}