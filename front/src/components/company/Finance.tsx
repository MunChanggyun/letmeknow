import React from 'react'
import Table from '../common/Table'
import {useSelector} from 'react-redux'
import {RootState} from '../../modules'

// 이중 배열로 가져와서 . tr > Array(data).fill().map( td) 형태로 테이블 구성

// TODO 삭제예정 20210406 redux 적용시 type 삭제 useSelector 사용
const Finance: React.FC = () => {
    const {finances} =useSelector(({company}:RootState) => ({
        finances: company.finances
    }))

    console.log(finances)

    return (
        <Table finances={(finances || [])}/>
    )
}

export default React.memo(Finance);