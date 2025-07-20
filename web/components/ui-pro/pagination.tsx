import { useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

function getPages(current: number, totalPages: number) {
  if (totalPages < 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pagination: (number | string)[] = [];
  // 总页数大于10，生成第一个页、最后一页、当前页及其前后两个页码
  const startPage = Math.max(1, current - 2);
  const endPage = Math.min(totalPages, current + 2);

  // 添加第一页
  pagination.push(1);
  // 添加省略号（如果当前页前有足够多的页码）
  if (startPage > 2) {
    pagination.push('...');
  }
  // 添加当前页及其前后两个页码
  for (let i = startPage; i <= endPage; i++) {
    if (i === 1 || i === totalPages) continue; // 避免重复添加第一页和最后一页
    pagination.push(i);
  }
  // 添加省略号（如果当前页后有足够多的页码）
  if (endPage < totalPages - 1) {
    pagination.push('...');
  }
  // 添加最后一页
  pagination.push(totalPages);

  return pagination;
}

export interface PaginationProps {
  pageIndex: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}

function ListPagination({
  pageIndex,
  total = 1,
  pageSize = 10,
  onChange,
}: PaginationProps) {
  const current = pageIndex === undefined ? 1 : pageIndex;
  const totalPages = Math.ceil(total / (pageSize || 10));

  const showPages = useMemo(() => {
    return getPages(current, totalPages);
  }, [current, totalPages]);

  const handleChange = (current: number) => {
    onChange?.(current);
  };
  return (
    <Pagination className='py-6'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={() => handleChange(current - 1)}
            className={
              !current || current === 1 ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
        {showPages.map((page, index) => (
          <PaginationItem key={page + '_' + index}>
            {page === '...' ? (
              <PaginationEllipsis className='w-8 text-center'>
                ...
              </PaginationEllipsis>
            ) : (
              <PaginationLink
                isActive={pageIndex === page}
                onClick={() => handleChange(page as number)}
                className='cursor-pointer'
              >
                {/* <Link href={`?page=${page}`} > */}
                {page}
                {/* </Link> */}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={() => handleChange(current + 1)}
            className={
              !totalPages || current === totalPages
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default ListPagination;
