import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

type CustomAction = {
  icon: React.ReactNode;
  colorScheme: string;
  tooltipLabel?: string;
  action: (item: any) => void;
};

type IndexPageProps<T> = {
  entityName: string;
  fetchUrl: string;
  columns: ColumnDef<T>[];
  updateVision?: () => void;
  createUrl?: string;
  viewUrl?: (id: number) => string;
  editUrl?: (id: number) => string;
  customActions?: CustomAction[];
  hiddenRemove?: boolean;
  refreshFlag?: number; // Adiciona a prop refreshFlag
};

export default function IndexPage<T extends { id: number }>({
  entityName,
  fetchUrl,
  columns,
  updateVision,
  createUrl,
  viewUrl,
  editUrl,
  customActions,
  hiddenRemove,
  refreshFlag,
}: IndexPageProps<T>) {
  const router = useRouter();
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [data, setData] = useState<T[]>([]);
      const response = await axios.get(fetchUrl);
      const fetchData = response?.data;
      setData(fetchData);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Erro ao tentar buscar usuários',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
}
