import React, {useEffect, MouseEvent} from 'react'
import Button from '../../components/common/Button'
import {useDispatch, useSelector} from 'react-redux'
import {cCodeList} from '../../modules/company'
import {RootState} from '../../modules'

const Company: React.FC = () => {
    const dispath = useDispatch();

    const {codeListError} = useSelector(({company}: RootState) => ({
        codeListError: company.codeListError
    }))

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispath(cCodeList());
    }

    useEffect(() => {
        if (codeListError) {
            console.log("회사코드 최신화에 실패했습니다.");
        }
        else {
            console.log("회사코드가 최신화 되었습니다.");
        }

    },[codeListError])

    return (
        <form onSubmit={onSubmit}>
            <Button classes="fullWidth" >회사코드 최신화</Button>
        </form>
        
    )
}

export default Company