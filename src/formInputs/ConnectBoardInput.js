import { SELECT_NULL } from '../constants';
import { getBoardItemsFromSettingStr } from '../utils/misc';

// Move data fetching part in save contact?
export default function ConnectBoardInput(input) {
	const { rowItems, boardId } = getBoardItemsFromSettingStr(input);
	console.log('rowItems=>', rowItems);
	console.log({ boardId });
	return renderUI({ input, rowItems });
}

function renderUI({ input, rowItems }) {
	const { id, title, value } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle('')
		.setFieldName(id)
		.addItem('--Select Item--', SELECT_NULL, true);

	if (rowItems.length) {
		for (let b of rowItems) {
			// const isSelected = value && b.id === value.toString() ? true : false;
			dropdown.addItem(b.name, b.id, false);
		}
	}

	return dropdown;
}
