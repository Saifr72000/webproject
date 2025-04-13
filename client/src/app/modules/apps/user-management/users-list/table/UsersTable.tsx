import {useMemo} from 'react'
import {useReactTable, Row, getCoreRowModel} from '@tanstack/react-table'
import {CustomHeaderColumn} from './columns/CustomHeaderColumn'
import {CustomRow} from './columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../core/QueryResponseProvider'
import {usersColumns} from './columns/_columns'
import {User} from '../core/_models'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {UsersListPagination} from '../components/pagination/UsersListPagination'
import {KTCardBody} from '../../../../../../_metronic/helpers'

const UsersTable = () => {
  const users = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const data = useMemo(() => users, [users])
  const columns = useMemo(() => usersColumns, [])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id='kt_table_users'
          className='table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer'
        >
          <thead>
          {table.getHeaderGroups().map((columnGroup) => (
            <tr key={columnGroup.id} className='text-start text-muted fw-bolder fs-7 text-uppercase gs-0'>
              {columnGroup.headers.map((header) => (
                  <CustomHeaderColumn key={header.id} header={header} />
              ))}
            </tr>)
          )}
          </thead>
          <tbody className='text-gray-600 fw-bold'>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: Row<User>) => {
                return <CustomRow key={row.id} row={row} />
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <UsersListPagination />
      {isLoading && <UsersListLoading />}
    </KTCardBody>
  )
}

export {UsersTable}
