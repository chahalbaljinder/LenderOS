import { useListApiKeys } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function ApiKeysPage() {
  const { data: keysRes, isLoading, refetch } = useListApiKeys();

  const keys = keysRes?.data || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>API Keys</h1>
      <ul>
        {keys.map((key: any) => (
          <li key={key.id}>{key.name}</li>
        ))}
      </ul>
    </div>
  );
}