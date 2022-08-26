import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import MEControlledSelect, { MEControlledSelectProps } from './MEControlledSelect'
import { firestore } from '../firebase';
import { collection, getDocs, query, where, WhereFilterOp } from 'firebase/firestore';

export default function MEFirestoreSelect({
  control,
  valueKey = 'id',
  labelKey = 'name',
  listName,
  where: whereQuery,
  options: unusedOptions,
  ...rest
}: MEControlledSelectProps & {
  listName: string,
  singularName: string,
  where?: [field: string, operator: WhereFilterOp, value: string][],
  valueKey: string,
  labelKey: string,
}) {
  const [options, setOptions] = useState<{ value: string| number, label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getData() {
    setIsLoading(true);
    var docsRef = collection(firestore, listName);
    var docsQueries = query(docsRef)
    if (whereQuery && whereQuery.length) {
      docsQueries = query(docsRef, ...whereQuery.map((w) => where(w[0], w[1], w[2])));
    }
    const docsSnapshot = await getDocs(docsQueries);
    setOptions(docsSnapshot.docs.map((d) => {
      return { 
        value: d.id,
        label: d.data().name
      }
    }));
    setIsLoading(false);
  }

  useEffect(() => {
    var isMounted = true;
    if (isMounted) {
      getData()
    }
    return () => {
      isMounted = false;
    };
  }, [])

  return (
    <MEControlledSelect
      control={control}
      options={options}
      isLoading={isLoading}
      {...rest}
    />
  )
}