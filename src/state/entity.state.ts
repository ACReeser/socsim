export interface IEntitySlice<T> {
    byID: { [key: number]: T },
    allIDs: number[]
}