import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getDangerInfo } from '../api/dangerAxios';
import backIcon from '../assets/images/icon/left-actionable.png';

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
  margin: 0 0 20px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

const RegistContainer = styled.div`
  position: fixed;
  bottom: 13vh;
  right: 5vw;
`;

const RegisterButton = styled.button`
  padding: 1.5vh 5vw;
  background-color: #27c384;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  z-index: 800;
  margin-top: 3vh;
  font-size: 15px;

  &:hover {
    background-color: #1ea774;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 70vh;
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
      if (!mapRef.current) return; // Check if mapRef is null

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: mapRef.current,
        icon: {
          url: 'markers/report.png',
          scaledSize: new window.naver.maps.Size(30, 30),
        },
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px; max-width:200px; border-radius:10px; border: 1px solid #27C384; background-color: #fff;">
                <h4 style="color: #333;">신고 제목: ${dangerTitle}</h4>
                <p style="color: #555;">신고 내용: ${dangerContent}</p>
                <p style="color: #777;">주소: 불러오는 중...</p>
              </div>`,
        backgroundColor: 'transparent',
        borderColor: '#27C384',
        borderWidth: '1px',
        anchorSize: new window.naver.maps.Size(0, 0),
        pixelOffset: new window.naver.maps.Point(-100, -200),
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      window.naver.maps.Event.addListener(mapRef.current, 'click', () => {
        infoWindow.close();
      });

      if (
        window.naver.maps.Service &&
        window.naver.maps.Service.reverseGeocode
      ) {
        window.naver.maps.Service.reverseGeocode(
          { coords: new window.naver.maps.LatLng(lat, lng) },
          (status: any, response: any) => {
            if (status === window.naver.maps.Service.Status.OK) {
              const address =
                response.v2.address.jibunAddress ||
                response.v2.address.roadAddress;
              const newContent = `<div style="padding:10px; max-width:200px; border-radius:10px; border: 1px solid #27C384; background-color: #fff;">
                              <h4 style="color: #333;">신고 제목: ${dangerTitle}</h4>
                              <p style="color: #555;">신고 내용: ${dangerContent}</p>
                              <p style="color: #777;">주소: ${address}</p>
                            </div>`;
              infoWindow.setContent(newContent);
              marker.address = address;
            } else {
              console.error('역지오코딩 실패:', status);
            }
          },
        );
      } else {
        console.error('Naver Maps Service가 정의되지 않았습니다.');
      }
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
    if (mapRef.current) {
      mapRef.current.setCenter(
        new window.naver.maps.LatLng(marker.lat, marker.lng),
      );
      // 추가 동작을 원하시면 여기에 작성하세요
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Title>
        <BackIcon src={backIcon} alt="Back" onClick={handleBack} />
        위험 지역 지도
      </Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="검색"
          value={searchTerm}
          onChange={handleSearch}
        />
      </SearchContainer>
      <MapContainer ref={mapContainer} />
      {filteredMarkers.length > 0 && (
        <MarkerList>
          {filteredMarkers.map((marker) => (
            <MarkerItem
              key={marker.id}
              onClick={() => handleMarkerClick(marker)}
            >
              {marker.dangerTitle}
            </MarkerItem>
          ))}
        </MarkerList>
      )}
      <RegistContainer>
        <RegisterButton onClick={() => navigate('/report')}>
          작성
        </RegisterButton>
      </RegistContainer>
    </Container>
  );
};

export default RiskMapPage;
