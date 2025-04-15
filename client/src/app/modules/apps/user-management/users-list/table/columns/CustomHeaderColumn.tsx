import {FC} from 'react'
import {flexRender, Header} from '@tanstack/react-table'
import {User} from '../../core/_models'

type Props = {
  header: Header<User, unknown>
}

const CustomHeaderColumn: FC<Props> = ({header}) => {
    return flexRender(
        header.column.columnDef.header,
        header.getContext()
    )
}

export {CustomHeaderColumn}
