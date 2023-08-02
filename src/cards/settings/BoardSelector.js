export default function BoardSelector() {
	const dropdownAction = CardService.newAction().setFunctionName('handleMondayBoardChange');

	let selectInput = CardService.newSelectionInput()
		.setFieldName('selectedMondayBoard')
		.setTitle('Monday Boards')
		.setOnChangeAction(dropdownAction)
		.setType(CardService.SelectionInputType.DROPDOWN);

	return selectInput;
}
