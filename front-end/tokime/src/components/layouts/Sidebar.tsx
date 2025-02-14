import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import sidebarIcon from '../../assets/images/icon/sidebar-icon.svg';
import TokimLogo from '../../assets/images/TokimEnglogo.png';
import sidebarUser from '../../assets/images/icon/sidebaruser.png';
import sidebarEmail from '../../assets/images/icon/sidebaremail.png';
import KakaoIcon from '../../assets/images/icon/kakao.svg'; // 카카오 아이콘 이미지
import GoogleIcon from '../../assets/images/icon/Google.png'; // 구글 아이콘 이미지
import Graph from '../charts/GaugeGraph'; // 이전에 만든 Graph 컴포넌트 가져오기
import { RootState } from '../../redux/store';
import userQuizPercentAxios from '../../api/userQuizPercentAxios';
import logoutAxios from '../../api/logoutAxios';
import { persistor } from '../../redux/reduxStore';
import withdrawAxios from '../../api/withdrawAxios';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.1);
  display: ${(props) =>
    props.$isOpen ? 'block' : 'none'}; /* 사이드바가 열리면 보이게 */
  z-index: 900;
`;

// SidebarContainer에서도 isOpen prop을 사용하는 부분 수정
const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${(props) =>
    props.$isOpen ? '0' : '-50vw'}; /* 너비를 기준으로 열리고 닫히도록 설정 */
  width: 50vw;
  height: 90vh;
  background-color: white;
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  padding: 2.5vh 2vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// 사이드바 아이콘 정의
const SidebarIcon = styled.img<{ $isOpen: boolean }>`
  position: relative;
  cursor: pointer;
  width: 10vw;
  visibility: ${(props) =>
    props.$isOpen ? 'hidden' : 'visible'}; /* visibility로 가리기 */
`;

// 로고 스타일 정의
const Logo = styled.img`
  display: block;
  margin: 0 auto 3vh auto;
  width: 30vw;
`;

// 점수와 백분위
const GaugeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  // margin-bottom: 2vh;
`;

// 점수 텍스트 스타일
const Score = styled.p`
  margin: 0;
  font-size: 5vw;
  font-weight: bold;
`;

// 백분위 텍스트 스타일
const Percentile = styled.p`
  font-size: 2.5vw;
  font-weight: bold;
  color: #333333;
`;

// 사용자 정보 섹션
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 35vh;
  // margin-top: 3vh;
`;

const UserName = styled.p`
  font-size: 3.5vw;
  margin-bottom: 1.5vh;
  font-weight: bold;
`;

const Icon = styled.img`
  width: 5vw;
  cursor: pointer;
`;

const Divider = styled.hr`
  width: 90%;
  border: none;
  border-top: 1px solid #000000;
  margin: 1.5vh 0;
`;

// 버튼 스타일 정의
const Button = styled.button<{ $bgColor: string; $boxShadow?: string }>`
  width: 80%;
  margin: 1vh auto;
  background-color: ${(props) => props.$bgColor}; // $bgColor prop을 사용
  color: white;
  font-size: 4vw;
  font-weight: bold;
  padding: 2vh 2vw;
  border: none;
  border-radius: 2vw;
  cursor: pointer;
  box-shadow: ${(props) => props.$boxShadow || 'none'};
  justify-content: space-between;
`;

const ButtonText = styled.span`
  margin-left: 2vw;
  color: #000000;
`;

// 버튼을 감싸는 컨테이너 스타일 정의
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 5vh; /* 버튼과 사이드바 아래쪽 여백 */
`;

// 모달 스타일 정의
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* 사이드바보다 큰 z-index 값 */
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 2100; /* 모달 내용도 사이드바보다 위에 있도록 설정 */
`;
const ModalButtonList = styled.div`
  display: flex;
  justify-content: space-evenly; /* 버튼 사이의 공간을 균등하게 배분 */
`;

const ModalButton = styled.button`
  margin-top: 10px;
  width: 37%;
  background-color: #00c99c;
  color: white;
  padding: 10px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
`;

const WithdrawBtn = styled.p`
  display: flex;
  justify-content: center;
  color: grey;
  text-decoration: underline;
  opacity: 0.6;
`;

const deleteAllCookies = () => {
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

function getCookieValue(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop();
    if (cookieValue) {
      return cookieValue.split(';').shift() || null; // split이나 shift가 undefined일 경우 null 반환
    }
  }
  return null; // 모든 경우에 대해 null 반환
}

function Sidebar() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user);
  const [percent, setPercent] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWithdrawOpen, setModalWithdrawOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const kakaoLoginUrl = `${process.env.REACT_APP_API_URL}/oauth2/authorization/kakao`;
  const googleLoginUrl = `${process.env.REACT_APP_API_URL}/oauth2/authorization/google`;

  const handleKakaoLogin = () => {
    window.location.href = kakaoLoginUrl;
  };

  const handleGoogleLogin = () => {
    window.location.href = googleLoginUrl;
  };

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node) &&
      !modalOpen && // 모달이 열려 있을 경우 사이드바 닫기 방지
      !modalWithdrawOpen
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const authCookie = getCookieValue('Authorization');
    if (authCookie !== null) {
      const fetchPercent = async () => {
        const data = await userQuizPercentAxios();
        if (data) {
          setPercent(data);
        }
      };
      fetchPercent();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen, modalWithdrawOpen]);

  useEffect(() => {
    const authCookie = getCookieValue('Authorization');
    if (authCookie !== null) {
      const fetchParentInfo = async () => {
        const data = await userQuizPercentAxios();
        if (data) {
          setPercent(data);
        }
      };
      fetchParentInfo();
    }
  }, [modalOpen, modalWithdrawOpen]);

  const handleLogout = () => {
    const fetchLogout = async () => {
      const data = await logoutAxios();
      if (data) {
        persistor.purge();
        deleteAllCookies();
        dispatch({ type: 'RESET_ALL' });
      }
    };
    fetchLogout();
    setModalOpen(false); // 모달 닫기
  };

  const handleNavigateToLogin = () => {
    navigate('/login-required'); // LoginRequiredPage로 이동
  };

  const handleWithdraw = () => {
    const fetchLogout = async () => {
      const data = await withdrawAxios();
      // console.log(data); // 응답 데이터 확인
      if (data) {
        deleteAllCookies();
        persistor.purge();
        dispatch({ type: 'RESET_ALL' }); // Redux 상태 초기화
        navigate('/'); // 홈으로 리디렉션
      }
    };
    fetchLogout();
    setModalWithdrawOpen(false); // 모달 닫기
  };
  return (
    <>
      <SidebarIcon
        src={sidebarIcon}
        alt="Sidebar Icon"
        onClick={toggleSidebar}
        $isOpen={isSidebarOpen}
      />
      {/* 오버레이 추가 */}
      <Overlay
        $isOpen={isSidebarOpen}
        onClick={() => setIsSidebarOpen(false)}
      />

      {userInfo.name !== '' ? (
        <SidebarContainer ref={sidebarRef} $isOpen={isSidebarOpen}>
          <Logo src={TokimLogo} alt="Tokim Logo" />
          <GaugeWrapper
            onClick={() => {
              if (userInfo.quizScore !== -1) {
                navigate('/land-score');
              }
            }}
          >
            <Graph score={userInfo.quizScore} />
            <Score
              onClick={() => {
                if (userInfo.quizScore === -1) {
                  navigate('/land-purchase-quiz');
                }
              }}
              style={{
                cursor: userInfo.quizScore === -1 ? 'pointer' : 'default',
              }}
            >
              {userInfo.quizScore === -1
                ? '점수 측정하기'
                : `${userInfo.quizScore}점`}
            </Score>
            <Percentile>
              {userInfo.quizScore === -1
                ? ' 측정 전 입니다 '
                : ` 상위 ${percent} %`}
            </Percentile>
          </GaugeWrapper>

          <UserInfo>
            <Divider />
            <Icon src={sidebarUser} alt="유저 아이콘" />
            <UserName>{userInfo.name}</UserName>
            <Divider />
            <Icon src={sidebarEmail} alt="이메일 아이콘" />
            <UserName>{userInfo.email.split('@')[0]}</UserName>
            <Divider />
          </UserInfo>
          <ButtonContainer>
            {/* <Button $bgColor="#00C99C" onClick={() => navigate('/my-page')}>
              마이페이지
            </Button> */}
            <Button $bgColor="#00C99C" onClick={() => setModalOpen(true)}>
              로그아웃
            </Button>
            <WithdrawBtn onClick={() => setModalWithdrawOpen(true)}>
              회원탈퇴
            </WithdrawBtn>
          </ButtonContainer>
        </SidebarContainer>
      ) : (
        <SidebarContainer ref={sidebarRef} $isOpen={isSidebarOpen}>
          <Logo src={TokimLogo} alt="Tokim Logo" />
          <GaugeWrapper>
            <Graph score={userInfo.quizScore} />
            <UserName onClick={handleNavigateToLogin}>비회원 접속</UserName>
          </GaugeWrapper>
          <UserInfo>
            <UserName>더 많은 기능은</UserName>
            <UserName>로그인 후</UserName>
            <UserName>이용 가능합니다.</UserName>
          </UserInfo>
          <ButtonContainer>
            <Button $bgColor="#FEE500" onClick={handleKakaoLogin}>
              <Icon src={KakaoIcon} alt="카카오 아이콘" />
              <ButtonText>카카오로그인</ButtonText>
            </Button>
            <Button
              $bgColor="#FFFFFF"
              $boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
              onClick={handleGoogleLogin}
            >
              <Icon src={GoogleIcon} alt="구글 아이콘" />
              <ButtonText>구글로그인</ButtonText>
            </Button>
          </ButtonContainer>
        </SidebarContainer>
      )}
      {/* 모달 추가 */}
      {modalOpen && (
        <ModalContainer onClick={() => setModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>로그아웃하시겠습니까?</h3>
            <ModalButtonList>
              <ModalButton onClick={handleLogout}>확인</ModalButton>
              <ModalButton onClick={() => setModalOpen(false)}>
                취소
              </ModalButton>
            </ModalButtonList>
          </ModalContent>
        </ModalContainer>
      )}
      {modalWithdrawOpen && (
        <ModalContainer onClick={() => setModalWithdrawOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>정말 탈퇴하시겠습니까?</h3>
            <ModalButtonList>
              <ModalButton onClick={handleWithdraw}>확인</ModalButton>
              <ModalButton onClick={() => setModalWithdrawOpen(false)}>
                취소
              </ModalButton>
            </ModalButtonList>
          </ModalContent>
        </ModalContainer>
      )}
    </>
  );
}

export default Sidebar;
