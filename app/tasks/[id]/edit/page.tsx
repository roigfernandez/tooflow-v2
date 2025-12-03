import TaskEditForm from './TaskEditForm';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  return <TaskEditForm taskId={params.id} />;
}