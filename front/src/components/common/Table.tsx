import React from 'react'
import {FinanceType} from '../../types/FinanceType'
import Tr from './Tr'

type financeProps = {
    finances :FinanceType[]
}

const Table:React.FC<financeProps> = ({finances}: financeProps) => {
    return (
        <table>
            <colgroup>
				<col width="350"/>
				<col width="280"/>
                <col width="280"/>
                <col width="280"/>
                <col width="280"/>
                <col width="280"/>
                <col width="280"/>
			</colgroup>
            <thead>
                {finances && (<Tr trRow={finances[0]} tagType={"head"}/>)}
            </thead>
            <tbody>
                {finances && (finances || []).map((row:any, index:number) => (<Tr key={index} trRow={row} tagType={"body"}/>))}
            </tbody>
        </table>
    )
}

export default Table