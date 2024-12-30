// client/src/pages/ScamManagementPage.tsx (excerpt)

import React, { useEffect, useState } from 'react'
import { Page, BlockTitle, Card, List, ListInput, ListItem, Toggle, Button, Table, TableRow, TableCell, Preloader } from 'konsta/react'
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'
import { Icon } from '@iconify/react'

type ScamSearchMode = 'IP' | 'FINGERPRINT' | 'BANNED'

interface GroupedItem {
    groupKey: string
    count: number
    isBanned: boolean
    users: {
        id: number
        telegramUserId: string
        name: string
        isBanned: boolean
        roles: string[]
    }[]
}

const ScamManagementPage: React.FC = () => {
    const [searchMode, setSearchMode] = useState<ScamSearchMode[]>(['IP'])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [groups, setGroups] = useState<GroupedItem[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)

    // Expand/collapse
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

    // Dialog logic
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [dialogAction, setDialogAction] = useState<'BAN_ALL' | 'UNBAN_ALL' | 'DELETE_ALL' | 'BAN_USER' | 'UNBAN_USER' | 'DELETE_USER' | null>(null)
    const [targetGroupKey, setTargetGroupKey] = useState<string | null>(null)
    const [targetUserId, setTargetUserId] = useState<number | null>(null)

    // ----------------
    //  Data fetching
    // ----------------
    const generateQueries = () => {
        let query = ''
        searchMode.forEach((mode) => {
            query += `&mode=${mode}`
        })
        if (searchKeyword.trim()) {
            query += `&keyword=${encodeURIComponent(searchKeyword.trim())}`
        }
        return query
    }

    const fetchGroups = async (reset = false) => {
        if (loading || (!hasMore && !reset)) return
        setLoading(true)
        try {
            const resp = await axiosInstance.get(`/api/superadmin/scam-management?limit=20&offset=${reset ? 0 : offset}${generateQueries()}`)
            const newData: GroupedItem[] = resp.data
            if (reset) {
                setGroups(newData)
                setOffset(newData.length)
                setHasMore(newData.length > 0)
            } else if (newData.length > 0) {
                setGroups((prev) => [...prev, ...newData])
                setOffset((prevOffset) => prevOffset + newData.length)
            } else {
                setHasMore(false)
            }
        } catch (err) {
            console.error('Error fetching groups:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchMode])

    // -------------
    //   Searching
    // -------------
    const handleSearch = () => {
        setGroups([])
        setOffset(0)
        setHasMore(true)
        fetchGroups(true)
    }

    // -------------------
    //   Expand/Collapse
    // -------------------
    const toggleExpand = (groupKey: string) => {
        setExpandedGroup((prev) => (prev === groupKey ? null : groupKey))
    }

    // -------------
    // Dialog stuff
    // -------------
    const confirmAction = (
        action: 'BAN_ALL' | 'UNBAN_ALL' | 'DELETE_ALL' | 'BAN_USER' | 'UNBAN_USER' | 'DELETE_USER',
        groupKey: string | null,
        userId: number | null,
        customMessage: string
    ) => {
        setDialogMessage(customMessage)
        setDialogAction(action)
        setTargetGroupKey(groupKey)
        setTargetUserId(userId)
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setDialogAction(null)
        setTargetGroupKey(null)
        setTargetUserId(null)
    }

    const handleConfirmDialog = async () => {
        try {
            if (!dialogAction) return
            switch (dialogAction) {
                case 'BAN_ALL':
                    if (targetGroupKey) {
                        await axiosInstance.post('/api/superadmin/scam-management/ban-group', {
                            groupKey: targetGroupKey,
                            searchModes: searchMode
                        })
                    }
                    break
                case 'UNBAN_ALL':
                    if (targetGroupKey) {
                        await axiosInstance.post('/api/superadmin/scam-management/unban-group', {
                            groupKey: targetGroupKey,
                            searchModes: searchMode
                        })
                    }
                    break
                case 'DELETE_ALL':
                    if (targetGroupKey) {
                        await axiosInstance.delete(`/api/superadmin/scam-management/delete-group?groupKey=${encodeURIComponent(targetGroupKey)}`, {
                            data: { searchModes: searchMode }
                        })
                    }
                    break
                case 'BAN_USER':
                    if (targetUserId) {
                        await axiosInstance.post('/api/superadmin/scam-management/ban-user', {
                            userId: targetUserId
                        })
                    }
                    break
                case 'UNBAN_USER':
                    if (targetUserId) {
                        await axiosInstance.post('/api/superadmin/scam-management/unban-user', {
                            userId: targetUserId
                        })
                    }
                    break
                case 'DELETE_USER':
                    if (targetUserId) {
                        await axiosInstance.delete(`/api/superadmin/scam-management/delete-user/${targetUserId}`)
                    }
                    break
                default:
                    break
            }

            // Refresh
            setGroups([])
            setOffset(0)
            setHasMore(true)
            await fetchGroups(true)
        } catch (error) {
            console.error('Action error:', error)
        } finally {
            handleCloseDialog()
        }
    }

    // -------------
    //   Rendering
    // -------------
    return (
        <Page className="bg-black text-white !m-0 !p-0">
            <Navbar />
            <Sidebar />

            <BlockTitle large className="!mt-2 !mb-2 text-center text-lg font-bold">
                Scam Management
            </BlockTitle>

            <Card className="!m-2 !p-2 rounded-xl border border-gray-600 bg-[#1b1b1b]">
                <List className="!m-0 !p-0">
                    {/* 1) Search Input */}
                    <ListInput
                        label="Search"
                        type="text"
                        placeholder="Enter IP, fingerprint, or user..."
                        outline
                        className="!mb-2"
                        inputClassName="!text-sm !p-2"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />

                    {/* 2) Toggles for IP, Fingerprint, Banned */}
                    <ListItem
                        title="IP"
                        after={
                            <Toggle
                                checked={searchMode.includes('IP')}
                                onChange={(e) => {
                                    const isChecked = e.target.checked
                                    setSearchMode((prev) => (isChecked ? [...prev, 'IP'] : prev.filter((m) => m !== 'IP')))
                                }}
                            />
                        }
                    />
                    <ListItem
                        title="Fingerprint"
                        after={
                            <Toggle
                                checked={searchMode.includes('FINGERPRINT')}
                                onChange={(e) => {
                                    const isChecked = e.target.checked
                                    setSearchMode((prev) => (isChecked ? [...prev, 'FINGERPRINT'] : prev.filter((m) => m !== 'FINGERPRINT')))
                                }}
                            />
                        }
                    />
                    <ListItem
                        title="Banned"
                        after={
                            <Toggle
                                checked={searchMode.includes('BANNED')}
                                onChange={(e) => {
                                    const isChecked = e.target.checked
                                    setSearchMode((prev) => (isChecked ? [...prev, 'BANNED'] : prev.filter((m) => m !== 'BANNED')))
                                }}
                            />
                        }
                    />
                </List>

                {/* 3) Search Button */}
                <Button className="w-full !mt-3 rounded-full bg-blue-600 text-white !p-2 text-sm" onClick={handleSearch} disabled={loading}>
                    {loading ? <Preloader size="small" /> : 'Search'}
                </Button>
            </Card>

            {/* Results */}
            <Card className="!m-2 !p-2 rounded-xl border border-gray-600 bg-[#1b1b1b]">
                <Table className="w-full text-sm !m-0 !p-0">
                    <thead className="bg-[#2b2b2b]">
                        <TableRow>
                            <TableCell className="font-bold text-white !p-1 w-2/5">IP / Fingerprint</TableCell>
                            <TableCell className="font-bold text-white !p-1 w-1/6">#Users</TableCell>
                            <TableCell className="font-bold text-white !p-1 w-1/4">Actions (All)</TableCell>
                            <TableCell className="font-bold text-white !p-1">Expand</TableCell>
                        </TableRow>
                    </thead>
                    <tbody>
                        {groups.map((grp) => (
                            <React.Fragment key={grp.groupKey}>
                                <TableRow className="hover:bg-[#272727]">
                                    <TableCell className="text-gray-200 !p-1">{grp.groupKey || 'N/A'}</TableCell>
                                    <TableCell className="text-gray-200 !p-1">{grp.count}</TableCell>
                                    <TableCell className="text-gray-200 !p-1">
                                        <div className="flex flex-row items-center gap-2">
                                            {grp.isBanned ? (
                                                <Icon
                                                    icon="mdi:account-lock"
                                                    className="w-5 h-5 text-green-400 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        confirmAction('UNBAN_ALL', grp.groupKey, null, `Unban all in [${grp.groupKey}]?`)
                                                    }}
                                                />
                                            ) : (
                                                <Icon
                                                    icon="mdi:account-lock-open"
                                                    className="w-5 h-5 text-red-400 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        confirmAction('BAN_ALL', grp.groupKey, null, `Ban all in [${grp.groupKey}]?`)
                                                    }}
                                                />
                                            )}
                                            <Icon
                                                icon="mdi:delete"
                                                className="w-5 h-5 text-red-400 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    confirmAction(
                                                        'DELETE_ALL',
                                                        grp.groupKey,
                                                        null,
                                                        `Delete all users + group [${grp.groupKey}]? This is irreversible.`
                                                    )
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="!p-1">
                                        <Icon
                                            icon={expandedGroup === grp.groupKey ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                                            className="w-5 h-5 text-blue-300 cursor-pointer"
                                            onClick={() => toggleExpand(grp.groupKey)}
                                        />
                                    </TableCell>
                                </TableRow>

                                {expandedGroup === grp.groupKey &&
                                    grp.users.map((usr) => (
                                        <TableRow key={usr.id} className="bg-[#2a2a2a] hover:bg-[#333333]">
                                            <TableCell colSpan={2} className="text-sm text-gray-300 !p-2">
                                                <div className="mb-1">
                                                    UserID: #{usr.id} (TGID: {usr.telegramUserId})
                                                </div>
                                                <div className="mb-1">Name: {usr.name}</div>
                                                <div className="mb-1">Roles: {usr.roles.join(', ')}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-300 !p-2">
                                                <div className="flex flex-row items-center gap-3">
                                                    {usr.isBanned ? (
                                                        <Icon
                                                            icon="mdi:account-lock"
                                                            className="w-5 h-5 text-green-400 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                confirmAction('UNBAN_USER', null, usr.id, `Unban user [${usr.name}]?`)
                                                            }}
                                                        />
                                                    ) : (
                                                        <Icon
                                                            icon="mdi:account-lock-open"
                                                            className="w-5 h-5 text-red-400 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                confirmAction('BAN_USER', null, usr.id, `Ban user [${usr.name}]?`)
                                                            }}
                                                        />
                                                    )}
                                                    <Icon
                                                        icon="mdi:delete"
                                                        className="w-5 h-5 text-red-400 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            confirmAction('DELETE_USER', null, usr.id, `Delete user [${usr.name}]? This is irreversible.`)
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-400 !p-2 text-sm">User row</TableCell>
                                        </TableRow>
                                    ))}
                            </React.Fragment>
                        ))}

                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-2 text-gray-400">
                                    <Preloader size="small" />
                                </TableCell>
                            </TableRow>
                        )}

                        {!hasMore && !loading && groups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-400 py-2">
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDialog} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Page>
    )
}

export default ScamManagementPage
