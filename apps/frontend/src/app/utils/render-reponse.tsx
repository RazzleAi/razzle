import {
  IRazzleColumn,
  IRazzleContainer,
  IRazzleCustomList,
  IRazzleCustomTable,
  IRazzleLink,
  IRazzleList,
  IRazzleRow,
  IRazzleTable,
  IRazzleText,
  IRazzleWidget,
  IRazzleImage,
} from '@razzledotai/widgets'
import { Column, Row, Text } from '../razzle-widgets'
import { Container } from '../razzle-widgets/container'
import { CustomList } from '../razzle-widgets/custom-list'
import { CustomTable } from '../razzle-widgets/custom-table'
import { Link } from '../razzle-widgets/link'
import { List } from '../razzle-widgets/list'
import { Table } from '../razzle-widgets/table'
import { Image } from '../razzle-widgets/image'

export function renderReponse(widget: IRazzleWidget) {
  return renderResponseWidget(widget)
}

export function renderResponseWidget(widget: IRazzleWidget, key?: any) {
  switch (widget?.type) {
    case 'text':
      return <Text text={widget as IRazzleText} key={key} />

    case 'list':
      return <List list={widget as IRazzleList} key={key} />

    case 'table':
      return <Table table={widget as IRazzleTable} key={key} />

    case 'row':
      return <Row row={widget as IRazzleRow} key={key} />

    case 'column':
      return <Column column={widget as IRazzleColumn} key={key} />

    case 'container':
      return <Container key={key} container={widget as IRazzleContainer} />

    case 'link':
      return <Link link={widget as IRazzleLink} key={key} />

    case 'custom-list':
      return <CustomList list={widget as IRazzleCustomList} key={key} />

    case 'custom-table':
      return <CustomTable table={widget as IRazzleCustomTable} key={key} />

    case 'image':
      return <Image image={widget as IRazzleImage} key={key} />

    default:
      return <></>
  }
}
