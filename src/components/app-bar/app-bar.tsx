import { Header } from 'grommet';

export function AppBar(props: any) {
  return (
    <Header
      background="brand"
      pad={{ left: 'medium', right: 'small', vertical: 'small' }}
      elevation="small"
      {...props}
    />
  );
}
