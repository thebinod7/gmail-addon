import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';
import { SELECT_NULL, BOARD_COLUMNS } from '../../constants';
import createColumnSelector from '../widgets/BoardColumnSelector';
import { extractColumnsForEachField } from '../../utils/misc';

const { EMAIL, PERSON, PHONE, LINK, COLOR, DROPDOWN, DATE, TEXT, NUMBERS } = BOARD_COLUMNS;

export default function UpdateSettingsCard({ currentBoard, existingAllowedFields }) {
	try {
		const { id, is_admin } = getCurrentAccount();
		const { data } = fetchBoardItems();
		const { boards } = filterBoardByUser(id, data);
		const mappedGroups = mapGroupsByBoard(boards);
		const filteredBoards = filterSubitemBoards(boards);
		const { mappedColumns, boardOptions } = mapBoardColumnsAndSelectOptions(filteredBoards);
		const found = mappedColumns.find(f => f.boardId === currentBoard);
		const columnOptions = extractColumnsForEachField(found);

		return renderUI({
			boardOptions,
			columnOptions,
			currentBoard,
			mappedGroups,
			existingAllowedFields,
			columns: found?.columns || [],
			is_admin
		});
	} catch (err) {
		console.log('UpdateSettingsCardErr=>', err);
	}
}

function renderUI({
	boardOptions,
	columnOptions,
	currentBoard,
	mappedGroups,
	existingAllowedFields,
	columns,
	is_admin
}) {
	const jsonStrGroup = JSON.stringify(mappedGroups);
	const jsonStrColumns = JSON.stringify(columns);

	const boardData = boardOptions.find(f => f.value === currentBoard);

	let cardDivider = CardService.newDivider();

	let boardSelector = createBoardSelector({ is_admin });
	const formAction = CardService.newAction()
		.setFunctionName('handleSaveSettings')
		.setParameters({ groups: jsonStrGroup, columns: jsonStrColumns, boardData: JSON.stringify(boardData) });

	const btnDisabled = is_admin ? false : true;
	const btnSubmit = CardService.newTextButton()
		.setText('Submit')
		.setOnClickAction(formAction)
		.setDisabled(btnDisabled)
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED);

	if (boardOptions.length) {
		boardSelector.addItem('--Select--', SELECT_NULL, false);
		for (let b of boardOptions) {
			const selected = b.value.toString() === currentBoard;
			boardSelector.addItem(b.label, b.value.toString(), selected);
		}
	} else boardSelector.addItem('--Select--', SELECT_NULL, true);

	const text = createHeaderTxt();

	let cardSection = CardService.newCardSection();

	cardSection.addWidget(text).addWidget(cardDivider).addWidget(boardSelector).addWidget(cardDivider);

	if (columns.length) {
		const {
			emailColumns,
			phoneColumns,
			linkColumns,
			statusColumns,
			dropdownColumns,
			personColumns,
			dateColumns,
			textColumns,
			numberColumns
		} = columnOptions;
		for (let col of columns) {
			if (col.type === DATE) {
				const cols = createColumnSelector({ options: dateColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === EMAIL) {
				const cols = createColumnSelector({ options: emailColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === LINK) {
				const cols = createColumnSelector({ options: linkColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === PERSON) {
				const cols = createColumnSelector({ options: personColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === PHONE) {
				const cols = createColumnSelector({ options: phoneColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === COLOR) {
				const cols = createColumnSelector({ options: statusColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === DROPDOWN) {
				const cols = createColumnSelector({ options: dropdownColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === TEXT) {
				const cols = createColumnSelector({ options: textColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
			if (col.type === NUMBERS) {
				const cols = createColumnSelector({ options: numberColumns, col, existingAllowedFields });
				cardSection.addWidget(cols);
			}
		}
	}
	cardSection.addWidget(cardDivider).addWidget(btnSubmit);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
