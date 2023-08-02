import { SELECT_NULL } from '../../constants';

export default function BoardSelector() {
	const dropdownAction = CardService.newAction().setFunctionName('handleMondayBoardChange');

	let selectInput = CardService.newSelectionInput()
		.setFieldName('selectedMondayBoard')
		.setTitle('Monday Boards')
		.setOnChangeAction(dropdownAction)
		.setType(CardService.SelectionInputType.DROPDOWN)
		.addItem('--Select--', SELECT_NULL, true);

	return selectInput;
}
