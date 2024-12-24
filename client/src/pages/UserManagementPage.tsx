import React, { useState, useEffect, useRef } from 'react'
import { Page, BlockTitle, Table, TableCell, TableRow, Preloader } from 'konsta/react'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

interface RowInterface {
    id: number
    telegramUserId: number
    name: string
    roles: string[]
}
interface FiltersInterface {
    roles: string[]
    wallets: boolean | null
}

const UserManagementPage: React.FC = () => {
    const [rows, setRows] = useState<Partial<RowInterface>[]>([])
    const [offset, setOffset] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [filters, setFilters] = useState<FiltersInterface>({ roles: ['SUPERADMIN', 'CREATOR', 'USER'], wallets: null })
    const navigate = useNavigate()

    const containerRef = useRef<HTMLDivElement | null>(null)

    const generateQueries = () => {
        let query = ''

        // Keyword filter
        if (searchKeyword?.length) {
            query = `&keyword=${encodeURIComponent(searchKeyword)}`
        }

        // Roles filter
        if (filters.roles?.length < 3) {
            for (let role of filters.roles) {
                query += `&roles[]=${role}`
            }
        }

        // Wallets filter
        if (filters.wallets !== null) {
            query += `&hasWallets=${filters.wallets}`
        }

        return query
    }

    const fetchRows = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/api/users?limit=20&offset=${reset ? 0 : offset}${generateQueries()}`)
            const newRows = response.data

            if (reset) {
                setRows(newRows)
                setOffset(newRows.length)
                setHasMore(newRows.length > 0)
            } else if (newRows.length > 0) {
                setRows((prevRows) => [...prevRows, ...newRows])
                setOffset((prevOffset) => prevOffset + 20)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error fetching rows:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleScroll = () => {
        const container = containerRef.current
        if (!container) return
        const { scrollTop, scrollHeight, clientHeight } = container

        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
            fetchRows()
        }
    }

    const handleSearch = () => {
        setRows([])
        setHasMore(true)
        fetchRows(true)
    }

    const handleRoleChange = (role: string) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            roles: prevFilters.roles?.includes(role) ? prevFilters.roles.filter((e) => e !== role) : [...(prevFilters.roles || []), role]
        }))
    }

    const handleWalletChange = (value: boolean | null) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            wallets: value
        }))
    }

    useEffect(() => {
        fetchRows()
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [hasMore, loading])

    useEffect(() => {
        if (filters) {
            setRows([])
            setHasMore(true)
            fetchRows(true)
        }
    }, [filters])

    const letterColors: { [key: string]: string } = {
        U: '#babb6c',
        S: '#286333',
        C: '#3357FF'
    }

    // Delete User
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

    const handleDelete = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/users/${selectedUserId}`)
            setRows((prevRows) => prevRows.filter((row) => row.id !== selectedUserId))
            setDialogOpen(false)
        } catch (error) {
            console.error('Error deleting user:', error)
            setDialogOpen(false)
            window.alert('This user cannot be deleted. Because of many relations on the db records.')
        }
    }

    const handleOpenDialog = (id: number) => {
        setSelectedUserId(id)
        setDialogOpen(true)
    }

    return (
        <Page>
            <Navbar />

            <div style={{ zIndex: 200, position: 'relative' }}>
                <Sidebar />
            </div>

            <BlockTitle large style={{ marginTop: '14px', zIndex: 100, position: 'relative' }}>
                User Management
            </BlockTitle>

            {/* Search */}
            <div style={{ height: '43px', margin: '32px 10px 0 0', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{
                        padding: '8px',
                        border: '0.5px solid #ccc',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '300px',
                        background: 'transparent'
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        marginLeft: '8px',
                        backgroundColor: '#007aff',
                        borderRadius: '4px',
                        width: '83px'
                    }}
                >
                    {loading && searchKeyword ? <Preloader size="small" style={{ color: '#444' }} /> : <p>Search</p>}
                </button>
            </div>

            {/* Filters */}
            <div style={{ marginTop: '10px' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'end', paddingRight: '20px', gap: '62px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={filters.roles?.includes('SUPERADMIN')}
                                onChange={(e) => handleRoleChange('SUPERADMIN')}
                                style={{ marginRight: '8px' }}
                            />
                            Superadmin
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={filters.roles.includes('CREATOR')}
                                onChange={(e) => handleRoleChange('CREATOR')}
                                style={{ marginRight: '8px' }}
                            />
                            Creator
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={filters.roles.includes('USER')}
                                onChange={(e) => handleRoleChange('USER')}
                                style={{ marginRight: '8px' }}
                            />
                            User
                        </label>
                    </div>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'end', paddingRight: '20px', gap: '62px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="radio" checked={filters.wallets === null} onChange={() => handleWalletChange(null)} style={{ marginRight: '8px' }} />
                            All
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="radio" checked={filters.wallets === true} onChange={() => handleWalletChange(true)} style={{ marginRight: '8px' }} />
                            Has wallets
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="radio" checked={filters.wallets === false} onChange={() => handleWalletChange(false)} style={{ marginRight: '8px' }} />
                            No wallets
                        </label>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div
                ref={containerRef}
                style={{
                    marginTop: '14px',
                    overflowY: 'auto',
                    border: '0.5px solid #979797',
                    maxHeight: '99%',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#555 #333'
                }}
            >
                <Table className="!w-full border">
                    <thead style={{ position: 'sticky', top: 0, background: 'black', zIndex: 100 }}>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff', width: '60%' }}>Name</TableCell>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff', width: '25%' }}>Roles</TableCell>
                            <TableCell style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={`${row.id}-${index}`}
                                onClick={() => navigate(`/user/${row.id}`)}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#5f5f5f'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'black'
                                }}
                            >
                                <TableCell>@{row.name}</TableCell>
                                <TableCell>
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            gap: '5px',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {row.roles?.map((role) => (
                                            <span
                                                style={{
                                                    border: `1px solid ${letterColors[role[0]]}`,
                                                    borderRadius: '4px',
                                                    padding: '4px',
                                                    color: letterColors[role[0]]
                                                }}
                                            >
                                                {role[0]}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="flex items-center justify-center">
                                    <Icon
                                        icon="mdi:delete"
                                        className="w-6 h-6 text-red-400"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenDialog(row.id)
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Confirmation Dialog */}
                        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogContent>
                                <DialogContentText>Are you sure you want to delete this user? This action cannot be undone.</DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDialogOpen(false)} color="secondary">
                                    Cancel
                                </Button>
                                <Button onClick={handleDelete} color="primary" autoFocus>
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {loading && (
                            <TableRow>
                                <TableCell className="text-center" colSpan={3}>
                                    <Preloader size="small" />
                                </TableCell>
                            </TableRow>
                        )}

                        {!hasMore && !loading && (
                            <TableRow>
                                <TableCell className="text-center" style={{ opacity: 0.7 }} colSpan={3}>
                                    No more data available
                                </TableCell>
                            </TableRow>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Move to Top Button */}
            {containerRef.current && containerRef.current.scrollTop > 100 && (
                <button
                    onClick={() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: '#5d6670',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        cursor: 'pointer',
                        zIndex: 1000
                    }}
                >
                    ↑
                </button>
            )}
        </Page>
    )
}

export default UserManagementPage
