export type FinanceType = {
    account_id: string,
    account_nm: string,
    data: FinanceDataType[]
}

export type FinanceDataType = {
    name: string,
    amount: string
}