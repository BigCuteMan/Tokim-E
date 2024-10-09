import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getDangerInfo } from '../api/dangerAxios';
import backIcon from '../assets/images/icon/left-actionable.png';
import searchIcon from '../assets/images/icon/search.svg';
import RiskMapModal from '../components/modals/RiskMapModal'; // 모달 컴포넌트 임포트

// 스타일드 컴포넌트 정의
const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f3f7fb;
`;

const Title = styled.h2`
  margin: 0 0 3vh 0;
  font-size: 25px;
  font-weight: bold;
  font-family: 'KoddiUD OnGothic';
  color: #333333;
  display: flex;
  justify-content: left;
`;

const BackIcon = styled.img`
  margin-right: 10px;
`;

const SearchContainer = styled.div`
  padding: 10px;
  background-color: #f3f7fb;
  display: flex;
  align-items: center; // 세로 중앙 정렬
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 10px;
`;

const RegistContainer = styled.div`
  position: relative; // relative로 변경
  margin-top: 3vh; // 리스트와의 간격
  z-index: 800; // 다른 요소들과 겹치지 않도록 z-index 설정
  margin-left: 15vw;
`;

const RegisterButton = styled.button`
  padding: 1.5vh 5vw;
  background-color: #27c384;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  font-size: 15px;

  &:hover {
    background-color: #1ea774;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 55vh;
`;

const MarkerList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MarkerItem = styled.li`
  padding: 10px;
  margin: 5px 0;
  background-color: #fff;
  border: 1px solid #27c384;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const RiskMapPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [markers, setMarkers] = useState<any[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadNaverMapApi = () => {
      return new Promise((resolve, reject) => {
        if (window.naver && window.naver.maps) {
          resolve(true);
        } else {
          const script = document.createElement('script');
          script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.REACT_APP_NAVERMAP_API_KEY}&submodules=geocoder`;
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Naver Maps API 로드 실패.'));
          document.body.appendChild(script);
        }
      });
    };

    const initMap = () => {
      return new Promise((resolve) => {
        if (mapContainer.current) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const map = new window.naver.maps.Map(mapContainer.current, {
                center: new window.naver.maps.LatLng(latitude, longitude),
                zoom: 14,
                draggable: true,
                zoomControl: true,
                scaleControl: true,
                minZoom: 6,
                maxZoom: 25,
              });
              mapRef.current = map;
              resolve(true); // Resolve the promise after map is initialized
            },
            (error) => {
              console.error('위치 정보 가져오기 실패:', error);
              const map = new window.naver.maps.Map(mapContainer.current, {
                center: new window.naver.maps.LatLng(37.5665, 126.978),
                zoom: 14,
                draggable: true,
                zoomControl: true,
                scaleControl: true,
                minZoom: 6,
                maxZoom: 25,
              });
              mapRef.current = map;
              resolve(true); // Resolve the promise after map is initialized
            },
          );
        }
      });
    };

    const createMarker = async (
      lat: number,
      lng: number,
      dangerTitle: string,
      dangerContent: string,
    ) => {
      if (!mapRef.current) return;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: mapRef.current,
        icon: {
          url: 'markers/report.png',
          scaledSize: new window.naver.maps.Size(30, 30), // 마커 크기
        },
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        setSelectedMarker({ lat, lng, dangerTitle, dangerContent });
        setModalOpen(true); // 모달 열기
      });

      window.naver.maps.Event.addListener(mapRef.current, 'click', () => {
        setModalOpen(false);
      });
    };

    const fetchData = async () => {
      try {
        const dangerData = await getDangerInfo();
        if (dangerData && dangerData.length > 0) {
          setMarkers(dangerData);
          dangerData.forEach((danger: any) => {
            const { lat, lng, dangerTitle, dangerContent } = danger;
            createMarker(lat, lng, dangerTitle, dangerContent);
          });
          setFilteredMarkers([]); // 초기 필터링 목록을 빈 배열로 설정
        } else {
          console.error('위험 신고 데이터를 가져오지 못했습니다.');
        }
      } catch (error) {
        console.error('위험 신고 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    loadNaverMapApi()
      .then(initMap)
      .then(fetchData)
      .catch((error) => {
        console.error('지도 로드 중 오류 발생:', error);
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    // 마커 제목이나 내용에 검색어가 포함된 경우 필터링
    const filtered = markers.filter(
      (marker) =>
        marker.dangerTitle.toLowerCase().includes(term.toLowerCase()) ||
        marker.dangerContent.toLowerCase().includes(term.toLowerCase()),
    );
    setFilteredMarkers(filtered);
  };

  const handleMarkerClick = (marker: any) => {
    const { lat, lng } = marker;
    mapRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
    mapRef.current.setZoom(15);
  };

  const handleRegister = () => {
    // 작성 버튼 클릭 시 등록 로직 추가
    navigate('./report'); // 등록 페이지로 이동
  };

  return (
    <Container>
      <Title>
        <BackIcon src={backIcon} alt="뒤로가기" onClick={() => navigate(-1)} />
        위험 신고 지도
      </Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="신고 제목 또는 내용을 검색하세요"
          maxLength={200}
          value={searchTerm}
          onChange={handleSearch}
        />
        <SearchIcon src={searchIcon} alt="검색 아이콘" />
      </SearchContainer>
      <MapContainer ref={mapContainer} />
      <MarkerList>
        {filteredMarkers.length > 0 &&
          filteredMarkers.map((marker, index) => (
            <MarkerItem key={index} onClick={() => handleMarkerClick(marker)}>
              <strong>{marker.dangerTitle}</strong>
              <p>{marker.dangerContent}</p>
            </MarkerItem>
          ))}
      </MarkerList>
      <RegistContainer>
        <RegisterButton onClick={handleRegister}>
          기획부동산 의심 토지 신고하기
        </RegisterButton>
      </RegistContainer>
      {/* 모달 컴포넌트 추가 */}
      <RiskMapModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        markerData={selectedMarker}
      />
    </Container>
  );
};

export default RiskMapPage;
