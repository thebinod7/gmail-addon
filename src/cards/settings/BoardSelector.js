export default function BoardSelector({ is_admin }) {
	const dropdownAction = CardService.newAction().setFunctionName('handleMondayBoardChange');

	const adminInfo = is_admin ? '' : ' (For admins only!)';

	let selectInput = CardService.newSelectionInput()
		.setFieldName('selectedMondayBoard')
		.setTitle('Monday Boards' + adminInfo)
		.setOnChangeAction(dropdownAction)
		.setType(CardService.SelectionInputType.DROPDOWN);

	return selectInput;
}
