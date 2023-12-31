import { fetchBoardColumns, fetchUsersByBoard } from '../../services/monday';
import { createFormInputByType } from '../../utils';

export default function addBoardItemCard({ currentConnectBoard }) {
	if (!currentConnectBoard) return renderBlankUI();
	try {
		const res = fetchBoardColumns(currentConnectBoard);
		const { data: boardUserData } = fetchUsersByBoard(currentConnectBoard);
		const boardUsers = boardUserData?.boards[0]?.subscribers || [];

		const { boards } = res.data;
		const foundBoard = boards.length ? boards[0] : null;
		if (!foundBoard) return renderBlankUI();
		return renderFormUI({ foundBoard, boardUsers, boardId: currentConnectBoard });
	} catch (err) {
		console.log('ConnectBoardColumFetchErr:', err);
	}
}

function renderFormUI({ foundBoard, boardUsers, boardId }) {
	const { columns } = foundBoard;
	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Add Board Item').addWidget(cardDivider);

	for (let f of columns) {
		let _input = createFormInputByType({ input: f, boardUsers });
		if (_input) section.addWidget(_input);
	}

	const jsonStringColumns = JSON.stringify(columns);
	const formAction = CardService.newAction()
		.setFunctionName('handleSaveConnectBoardItem')
		.setParameters({ columns: jsonStringColumns, boardId });
	const btnSubmit = CardService.newTextButton()
		.setText('Submit')
		.setOnClickAction(formAction)
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
	const card = CardService.newCardBuilder().addSection(section.addWidget(btnSubmit)).build();

	return card;
}

function renderBlankUI() {
	const firstTimeMsg = CardService.newTextParagraph().setText('Board not found!');

	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(firstTimeMsg))
		.build();
	return updatedCard;
}
