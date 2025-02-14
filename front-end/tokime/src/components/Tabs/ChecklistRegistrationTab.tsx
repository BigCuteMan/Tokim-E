import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { getCheckList } from '../../api/landInvestAxios'; // API 경로에 맞게 수정하세요
import LoadingSpinner from '../layouts/LoadingSpinner';
import checkIcon from '../../assets/images/icon/체크x.png'; // 체크 아이콘 경로
import checkedIcon from '../../assets/images/icon/체크.png'; // 선택된 아이콘 경로 (새로운 체크 아이콘)
import symbol from '../../assets/images/checklist/free-icon-warning-4931430.png';
import uncheck from '../../assets/images/checklist/uncheck.png';

// 체크리스트 이미지 불러오기
import checklist1 from '../../assets/images/checklist/체크리스트1.png';
import checklist2 from '../../assets/images/checklist/체크리스트2.png';
import checklist3 from '../../assets/images/checklist/체크리스트3.png';
import checklist4 from '../../assets/images/checklist/체크리스트4.png';
import checklist5 from '../../assets/images/checklist/체크리스트5.png';
import checklist6 from '../../assets/images/checklist/체크리스트6.png';
import checklist7 from '../../assets/images/checklist/체크리스트7.png';
import checklist8 from '../../assets/images/checklist/체크리스트8.png';
import checklist9 from '../../assets/images/checklist/체크리스트9.png';
import checklist10 from '../../assets/images/checklist/체크리스트10.png';
import checklist11 from '../../assets/images/checklist/체크리스트11.png';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f3f7fb;
`;

const Title = styled.h1`
  font-size: 7vw; /* 반응형 폰트 크기 */
  font-weight: bold;
  color: #333333;
  margin-bottom: 5vh;
  margin-left: 3vw;
  white-space: pre-line; /* 텍스트 안에서 줄바꿈 처리 */
`;

const ChecklistContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2vh; /* 체크리스트 항목 간격을 2vh로 설정 */
`;

const ChecklistItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%; /* 컨테이너 너비 반응형 */
  padding: 2vh 2vw; /* 안쪽 여백 반응형 */
  background-color: #e8eef3; /* 체크 여부에 상관없이 동일 배경색 */
  border-radius: 1vw; /* 반응형 모서리 둥글기 */
  position: relative;
  transition: background-color 0.3s;
  cursor: pointer; /* 클릭 가능하게 변경 */
  overflow-y: auto;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1vh; /* 이미지와 설명 텍스트 사이 간격 */
`;

const ChecklistImage = styled.img`
  width: 6vw;
  height: 6vw;
  margin-right: 1vw; /* 이미지와 텍스트 사이 간격 */
  margin-left: 4vw; /* 이미지와 텍스트 사이 간격 */
`;

const TitleText = styled.div`
  font-size: 3.5vw;
  font-weight: bold;
  line-height: 1.2;
  max-width: 61.11vw; /* 타이틀 텍스트 너비 설정 */
  margin-left: 2.78vw; /* 이미지와 타이틀 텍스트 간격 */
  white-space: pre-line; /* 줄바꿈 적용 */
`;

const DescriptionText = styled.div`
  font-size: 3vw; /* 설명 텍스트 폰트 크기 반응형 */
  color: #666;
  max-width: 220px; /* 설명 텍스트의 최대 너비 */
  margin-left: 4vw; /* 왼쪽 간격 */
`;

const CheckIcon = styled.img`
  width: 8vw;
  height: 8vw;
  position: absolute;
  right: 5vw;
  top: 50%;
  transform: translateY(-50%); /* 체크 아이콘을 컨테이너 중간에 맞추기 */
`;

const RegistContainer = styled.div`
  display: flex;
  justify-content: right;
`;

const RegisterButton = styled.button`
  padding: 2vh 7vw; /* 버튼 패딩을 반응형으로 설정 */
  background-color: #27c384;
  color: #fff;
  border: none;
  border-radius: 3vw; /* 반응형 모서리 둥글기 */
  font-weight: bold;
  cursor: pointer;
  margin-top: 3vh;
  font-size: 4vw; /* 폰트 크기 반응형 */
  margin: 3vh 2vw 0 2vw; /* 버튼 간격 */
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  padding: 2vh 7vw;
  font-family: 'KoddiUD OnGothic';
  background-color: ${(props) => (props.primary ? '#F3D1D3' : '#E0E0E0')};
  color: ${(props) => (props.primary ? '#000' : '#666')};
  border: none;
  border-radius: 1vw;
  font-weight: bold;
  cursor: pointer;
  margin-top: 3vh;
  font-size: 3.1vw;
  border-radius: 10px;
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 90vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  overflow-y: auto;
`;

const ModalContainer = styled.div`
  width: 80%;
  height: 95%;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  // overflow: hidden; /* Prevents the entire modal from scrolling */
`;

const ModalTitle = styled.h2`
  color: #333;
  font-size: 5vw;
  font-weight: bold;
  margin-bottom: 2vh;
  text-align: center;
`;

const ModalDescription = styled.p`
  color: #666;
  font-size: 3.5vw;
  text-align: center;
  margin-bottom: 4vh;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 2vh;
`;

const UncheckedItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1vh 2vw;
  background-color: #f8f8f8;
  border-radius: 1vw;
  margin-bottom: 2vh;
  position: relative;
`;

const UncheckedImage = styled.img`
  width: 7vw;
  height: 7vw;
  margin-right: 3vw;
`;

const UncheckedImage2 = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 1vw;
`;
const CheckedIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 1vw;
`;

const UncheckedTitle = styled.span`
  font-size: 3.5vw;
  font-weight: bold;
  color: #333;
`;

const WarningIcon = styled.img`
  width: 4vw;
  height: 4vw;
  position: absolute;
  right: 2vw;
  top: 50%;
  transform: translateY(-50%);
`;

const CautionText = styled.h5`
  align-items: center;
  color: #842222;
`;

const CautionTextContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2vh; /* 필요한 경우 간격 조정 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0; /* Ensures the header doesn't shrink */
  width: 100%;
  text-align: center;
  padding-bottom: 10px;
`;

interface ChecklistItem {
  checklistId: number;
  content: string;
}

interface ChecklistRegistrationTabProps {
  check: number[];
  setCheck: React.Dispatch<React.SetStateAction<number[]>>;
  onNext: () => void;
  onPrevious: () => void;
}

interface UncheckedItemType {
  index: number;
  content: string;
}

const ChecklistRegistrationTab: React.FC<ChecklistRegistrationTabProps> = ({
  check,
  setCheck,
  onNext,
  onPrevious,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uncheckedItems, setUncheckedItems] = useState<UncheckedItemType[]>([]);
  const modalRef = useRef<HTMLDivElement>(null); // 모달창을 참조할 ref 생성

  // 체크리스트 제목 배열
  const titles = [
    '직접 가보셨나요?',
    '개발이 가능한 지역인가요?',
    '고도가 낮고 경사가 완만한가요?',
    '구체적인 개발 계획이 있나요?',
    '인근 지역에만 개발 호재가 있지는\n않나요?',
    '공유지분으로 거래하진 않나요?',
    '정확한 정보를 사전에 받으셨나요?',
    '매수 금액이 적당한가요?',
    '주변 시세와 비교했을 때 가격이\n적절한가요?',
    '판매자의 신뢰할 수 있는\n상호인가요?',
    '법인이 아닌 개인 소유의\n토지인가요?',
  ];

  // 체크리스트 이미지 배열
  const images = [
    checklist1,
    checklist2,
    checklist3,
    checklist4,
    checklist5,
    checklist6,
    checklist7,
    checklist8,
    checklist9,
    checklist10,
    checklist11,
  ];

  useEffect(() => {
    const fetchChecklist = async () => {
      setLoading(true);
      const data = await getCheckList();
      if (data) {
        setChecklist(data);
        const initialCheckedItems = new Array(data.length).fill(false); // 모든 체크박스 초기화
        check.forEach((index) => {
          if (index < data.length) {
            initialCheckedItems[index] = true; // 초기 선택된 항목을 true로 설정
          }
        });
        setCheckedItems(initialCheckedItems);
      } else {
        setError('체크리스트를 가져오는 데 실패했습니다.');
      }
      setLoading(false);
    };

    fetchChecklist();
  }, [check]);

  const handleCheckboxChange = (index: number) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !updatedCheckedItems[index]; // 체크 여부 반전
    setCheckedItems(updatedCheckedItems);
  };

  const checkedCount = checkedItems.filter(Boolean).length; // 선택된 항목 개수

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달창 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal(); // 모달창 외부 클릭 시 모달 닫기
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const handleNext = async () => {
    const checkedIndices = checkedItems
      .map((checked, index) => (checked ? index : null))
      .filter((index) => index !== null) as number[];

    setCheck(checkedIndices); // 선택된 인덱스 저장

    const unchecked = checkedItems
      .map((isChecked, index) =>
        !isChecked ? { index, content: checklist[index].content } : null,
      )
      .filter(Boolean) as UncheckedItemType[];

    if (unchecked.length > 0) {
      setUncheckedItems(unchecked);
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />; // 로딩 중일 때 로딩 스피너 표시
  }

  if (error) {
    return <div>{error}</div>; // 오류가 발생하면 오류 메시지 표시
  }

  return (
    <Container>
      <Title>{`토지구매 전에\n확인해보셨나요?`}</Title>
      <ChecklistContainer>
        {checklist.map((item, index) => (
          <ChecklistItemContainer
            key={item.checklistId}
            onClick={() => handleCheckboxChange(index)} // 컨테이너 클릭 시 상태 변경
          >
            <TopRow>
              <ChecklistImage
                src={images[index]} // 체크리스트 이미지
                alt={`Checklist ${index + 1}`}
              />
              <TitleText>{`${index + 1}. ${titles[index]}`}</TitleText>{' '}
              {/* 체크리스트 제목 */}
            </TopRow>
            <DescriptionText>{item.content}</DescriptionText>{' '}
            {/* 체크리스트 설명 */}
            <CheckIcon
              src={checkedItems[index] ? checkedIcon : checkIcon} // 체크 여부에 따라 아이콘 변경
              alt="check icon"
            />
          </ChecklistItemContainer>
        ))}
      </ChecklistContainer>

      <RegistContainer>
        <RegisterButton onClick={onPrevious}>이전</RegisterButton>{' '}
        {/* 이전 버튼 */}
        <RegisterButton onClick={handleNext}>다음</RegisterButton>{' '}
        {/* 다음 버튼 */}
      </RegistContainer>

      {isModalOpen && (
        <ModalBackground>
          <ModalContainer ref={modalRef}>
            {' '}
            {/* 모달창에 ref 추가 */}
            <ModalHeader>
              <ModalTitle>토지 구매 예정이신가요?</ModalTitle>
              <ModalDescription>
                토지 개발이 제한된 구역이거나 관련 사기로 인해 예상보다 큰
                비용이 발생할 수 있으니 반드시 체크리스트의 모든 항목을 확인하고
                투자하시길 바랍니다.
              </ModalDescription>
            </ModalHeader>
            <CautionTextContainer>
              {uncheckedItems.length !== 0 ? (
                <>
                  <UncheckedImage2 src={uncheck} alt="Unchecked Icon" />
                  <CautionText>아직 체크되지 않은 항목들입니다.</CautionText>
                </>
              ) : (
                <>
                  <CheckedIcon src={checkedIcon} alt="Unchecked Icon" />
                  <CautionText>
                    모든 항목을 체크하셨습니다.
                    <br />
                    등록하시겠습니까?
                  </CautionText>
                </>
              )}
            </CautionTextContainer>
            {uncheckedItems.length !== 0
              ? uncheckedItems.map((item, index) => (
                  <UncheckedItem key={index}>
                    <UncheckedImage
                      src={images[item.index]}
                      alt={`Unchecked ${item.index + 1}`}
                    />
                    <UncheckedTitle>{titles[index]}</UncheckedTitle>
                  </UncheckedItem>
                ))
              : null}
            <ModalButtonContainer>
              <ModalButton onClick={closeModal}>다시 체크하기</ModalButton>
              <ModalButton primary onClick={onNext}>
                등록하기
              </ModalButton>
            </ModalButtonContainer>
          </ModalContainer>
        </ModalBackground>
      )}
    </Container>
  );
};

export default ChecklistRegistrationTab;
