import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { Textarea } from './ui/textarea';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Batch = ({
  data,
  onSubmit,
}: {
  data?: any[];
  onSubmit: (val: any[]) => void;
}) => {
  const t = useTranslations('EditableTable');
  const [newData, setNewData] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setNewData(data ? JSON.stringify(data) : '');
    }
  }, [data]);

  const handleSubmit = () => {
    try {
      const parsedData = JSON.parse(newData);
      onSubmit(parsedData);
      setIsDialogOpen(false);
    } catch (e) {
      alert((e as Error).message);
      return;
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>{t('batchOperation')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('batchOperation')}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <Textarea
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditableTable = ({
  columns,
  dataSource,
}: {
  columns: { name: string; field: string }[];
  dataSource: any[];
}) => {
  const t = useTranslations('EditableTable');
  // 初始数据
  const [rows, setRows] = useState<any[]>();
  // 当前正在编辑的行 ID
  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  useEffect(() => {
    setRows(dataSource);
  }, [dataSource]);

  // 新增一行
  const handleAddRow = () => {
    const newRow = { id: (rows?.length || 0) + 1, name: '', age: '' };
    setRows(rows ? [...rows, newRow] : [newRow]);
    setEditingRowId(newRow.id); // 新增行默认进入编辑状态
  };

  // 处理输入框变化
  const handleInputChange = (id: number, field: string, value: string) => {
    const updatedRows = rows?.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  // 进入编辑状态
  const handleEditRow = (id: number) => {
    setEditingRowId(id);
  };

  // 保存编辑
  const handleSaveRow = (id: number) => {
    setEditingRowId(null); // 退出编辑状态
  };

  // 删除行
  const handleDeleteRow = (id: number) => {
    const updatedRows = rows?.filter((row) => row.id !== id);
    setRows(updatedRows);
  };

  const handleBatch = (val: any[]) => {
    setRows(val);
  };

  return (
    <div className='p-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-20'>{t('index')}</TableHead>
            {columns?.map((column) => (
              <TableHead key={column.field}>{column.name}</TableHead>
            ))}
            <TableHead className='w-40'>{t('action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows?.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell>{index + 1}</TableCell>
              {columns?.map((column) => (
                <TableCell key={column.field}>
                  {editingRowId === row.id ? (
                    <Input
                      value={row[column.field]}
                      onChange={(e) =>
                        handleInputChange(row.id, column.field, e.target.value)
                      }
                      className='w-full'
                    />
                  ) : (
                    row[column.field]
                  )}
                </TableCell>
              ))}
              <TableCell>
                {/* 操作列按钮 */}
                {editingRowId === row.id ? (
                  // 编辑状态：显示保存按钮
                  <Button
                    onClick={() => handleSaveRow(row.id)}
                    className='mr-2'
                    size='sm'
                  >
                    {t('save')}
                  </Button>
                ) : (
                  // 非编辑状态：显示编辑和删除按钮
                  <>
                    <Button
                      onClick={() => handleEditRow(row.id)}
                      className='mr-2'
                      size='sm'
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      onClick={() => handleDeleteRow(row.id)}
                      variant='destructive'
                      size='sm'
                    >
                      {t('delete')}
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 新增按钮 */}
      <div className='flex gap-4'>
        <Button onClick={handleAddRow}>{t('addRow')}</Button>
        <Batch data={rows} onSubmit={handleBatch} />
      </div>
    </div>
  );
};

export default EditableTable;
