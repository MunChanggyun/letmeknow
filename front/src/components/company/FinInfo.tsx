import React from 'react'
import Table from '../common/Table'
import {useSelector} from 'react-redux'
import {RootState} from '../../modules'

const FinInfo: React.FC = () => {
    const {finInfo} =useSelector(({company}:RootState) => ({
        finInfo: company.finInfo
    }))

    return (
        <Table finInfo={(finInfo || [])}/>
    )
}

export default React.memo(FinInfo);