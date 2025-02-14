package com.ssafy.tokime.controller;

import com.ssafy.tokime.dto.LawDTO;
import com.ssafy.tokime.dto.LawSearchDTO;
import com.ssafy.tokime.model.Land;
import com.ssafy.tokime.model.Law;
import com.ssafy.tokime.service.LandService;
import com.ssafy.tokime.service.LawService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.IllegalFormatException;
import java.util.List;

@RestController
@RequestMapping("/land")
@RequiredArgsConstructor
public class LandController {
    private static final Logger logger = LoggerFactory.getLogger(LandController.class);

    private final LandService landService;

    private final LawService lawService;

    // 토지 전체조회
    @GetMapping
    public ResponseEntity<?> getAllLands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try{
        Pageable pageable = PageRequest.of(page, size);
        Page<Land> landsPage = landService.getAllLands(pageable);
        return ResponseEntity.ok(landsPage.getContent());
        }catch (IllegalArgumentException e){
            return new ResponseEntity<>("유효하지 않은 page나 size 입니다",HttpStatus.BAD_REQUEST);
        }catch(DataAccessException e){
            return new ResponseEntity<>("DB접근 중 오류 발생",HttpStatus.INTERNAL_SERVER_ERROR);
        }catch(RuntimeException e){
            return new ResponseEntity<>("예상치 못한 에러 ", HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // 토지 검색 조회 district + address 필요
    @GetMapping("/search")
    public ResponseEntity<?> searchLands(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String address,
            @RequestParam(defaultValue = "0") int page,  // 페이지 번호, 기본값 0
            @RequestParam(defaultValue = "10") int size) {  // 페이지 크기, 기본값 5
        List<Land> lands;
        try {
            // 페이지
            Pageable pageable = PageRequest.of(page, size);

            if (district == null && address == null) {
                // 공백 입력
                return ResponseEntity.badRequest().body("검색 조건을 입력해주세요.");
            } else if (district != null && !district.trim().isEmpty() && (address == null || address.trim().isEmpty())) {
                // district만 입력했을 때
                lands = landService.searchByDistrictFullText(district.trim(),pageable);
            } else if (address != null && !address.trim().isEmpty() && (district == null || district.trim().isEmpty())) {
                // address만 입력했을 때
                lands = landService.searchByAddress(address.trim(),pageable);
            } else {
                logger.info("test"+district+" "+address);
                // 둘 다 입력했을 때j
                lands = landService.searchLands(district.trim(), address.trim(),pageable);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("유효한 값을 넣어주세요", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("서버 에러입니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(lands, HttpStatus.OK);
    }

    // 특정지번조례조회
    @GetMapping("/bylaw/{landDistrictCode}")
    public List<Law> getLaw(@PathVariable Long landDistrictCode){

        // long -> 문자열 변환
        String districtCodeStr = String.valueOf(landDistrictCode);
        if (districtCodeStr.length() > 5) {
            districtCodeStr = districtCodeStr.substring(0, 5);
        }
        Long lawDistrict = Long.valueOf(districtCodeStr);
        return lawService.selectAllLawByDistrict(lawDistrict);
    }

    // 조례 검색 조회
    @PostMapping("/bylaw/search")
    public ResponseEntity<?> searchLaw(@RequestBody LawSearchDTO dto){
        try {
            List<Law> lawlist = lawService.seacrchLawByLandUse(dto);
            return new ResponseEntity<>(lawlist,HttpStatus.OK);
        }catch (IllegalFormatException e) {
            return new ResponseEntity<>("잘못된 데이터 타입",HttpStatus.BAD_REQUEST);
        }catch(Exception e){
            return  new ResponseEntity<>("서버 에러",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
