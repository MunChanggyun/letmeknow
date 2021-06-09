import React from 'react'
import {FinanceType, FinanceInfoType} from '../../types/FinanceType'
import Tr from './Tr'

type financeProps = {
    finances? :FinanceType[],
    finInfo? : FinanceInfoType[]
}

const Table:React.FC<financeProps> = ({finances, finInfo}: financeProps) => {
    let tempArray:FinanceInfoType[] = [];
    return (
        <table>
            <thead>
                {finances && (<Tr trRow={finances[0]} tagType={"head"}/>)}
            </thead>
            <tbody>
                {finances && (finances || []).map((row:any, index:number) => (<Tr key={index} trRow={row} tagType={"body"}/>))}
                {finInfo && (finInfo || []).map((row:any, index:number) => {
                    if (index%2 === 0) {
                        tempArray = [];
                    }

                    tempArray.push(row);
                   
                    return tempArray.length === 2 && (<Tr key={row._id} trInfo={tempArray} tagType={"body"}/>) 
                })}
            </tbody>
        </table>
    )
}

export default React.memo(Table)