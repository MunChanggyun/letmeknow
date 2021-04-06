import React from 'react'
import Table from '../common/Table'
import {FinanceType} from '../../types/FinanceType'

// 이중 배열로 가져와서 . tr > Array(data).fill().map( td) 형태로 테이블 구성

// TODO 삭제예정 20210406 redux 적용시 type 삭제 useSelector 사용
type financeProps = {
    finance :FinanceType[]
}

const Finance: React.FC<financeProps> = ({finance}: financeProps) => {
    return (
        <Table finances={finance}/>
    )
}

export default React.memo(Finance);